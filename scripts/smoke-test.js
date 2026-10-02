/**
 * Smoke test for the CLI, it works on Windows, macOS and Linux
 * 1. Generate a project and resources, with the prompts and with the flags Claude Code uses
 * 2. Install the project with pnpm and type-check it
 * 3. Start the server and check the health check, the generated routes and Swagger
 * 4. If MONGODB_URI is set, also check the CRUD actions against that database
 */
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const cli = path.join(import.meta.dirname, '..', 'bin', 'execute');
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naf-smoke-'));
const projectDir = path.join(workDir, 'demo');
const port = Number(process.env.SMOKE_PORT) || 2199;
const baseUrl = `http://127.0.0.1:${port}`;
const mongoUri = process.env.MONGODB_URI;

let failures = 0;
let server;

const check = (name, ok, details = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !details ? '' : ` (${details})`}`);
  if (!ok) {
    failures++;
  }
};

const stripAnsi = (text) => text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');

/**
 * Run a CLI command, and answer its prompts when answers are given
 * @param args e.g. ['model', 'post', '--json']
 * @param answers list of [text of the prompt, answer to type]
 * @output { code, output }
 */
const runCli = (cwd, args, answers = []) => new Promise((resolve, reject) => {
  const env = { ...process.env, ...(answers.length ? { NAF_FORCE_PROMPTS: '1' } : {}) };
  const child = spawn(process.execPath, [cli, ...args], { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '';
  let next = 0;
  let searchFrom = 0;
  const onData = (chunk) => {
    output += stripAnsi(chunk.toString());
    while (next < answers.length) {
      const index = output.indexOf(answers[next][0], searchFrom);
      if (index === -1) {
        break;
      }
      searchFrom = index + answers[next][0].length;
      child.stdin.write(`${answers[next][1]}\n`);
      next++;
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  if (!answers.length) {
    child.stdin.end();
  }
  const timer = setTimeout(() => {
    child.kill();
    reject(new Error(`naf ${args.join(' ')} timed out, output:\n${output}`));
  }, 30000);
  child.on('close', (code) => {
    clearTimeout(timer);
    if (next < answers.length) {
      reject(new Error(`naf ${args.join(' ')} did not ask for "${answers[next][0]}", output:\n${output}`));
    } else {
      resolve({ code, output });
    }
  });
});

// run a command with --json and parse its output
const runJson = async (cwd, args) => {
  const { code, output } = await runCli(cwd, [...args, '--json']);
  let json;
  try {
    json = JSON.parse(output.trim().split('\n').pop());
  } catch {
    json = undefined;
  }
  return { code, json, output };
};

// shell is needed to find pnpm on Windows, the commands are fixed strings
const run = (command, cwd) => {
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    throw new Error(`${command} failed with code ${result.status}`);
  }
};

const request = async (method, url, body) => {
  const res = await fetch(`${baseUrl}${url}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: res.status, text, json };
};

const startServer = async () => {
  let output = '';
  server = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
    cwd: projectDir,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...(mongoUri ? { MONGODB_URI: mongoUri } : {}) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', (chunk) => { output += chunk; });
  server.stderr.on('data', (chunk) => { output += chunk; });
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(`${baseUrl}/`);
      return;
    } catch {
      if (server.exitCode !== null) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`server did not start, output:\n${stripAnsi(output)}`);
};

const main = async () => {
  console.log(`Working in ${workDir}`);

  // 1. Generate a project and resources with the prompts
  await runCli(workDir, ['init'], [['Project name', 'demo'], ['Database name', 'demodb']]);
  check('naf init creates the project', fs.existsSync(path.join(projectDir, 'package.json')));
  check('naf init adds .gitignore', fs.existsSync(path.join(projectDir, '.gitignore')) && !fs.existsSync(path.join(projectDir, 'gitignore')));
  check('naf init adds the Claude Code skill', fs.existsSync(path.join(projectDir, '.claude', 'skills', 'naf', 'SKILL.md')));
  check('naf init adds AGENTS.md for other agents', fs.readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8').includes('.claude/skills/naf/SKILL.md'));

  await runCli(projectDir, ['model'], [['Model name', 'blog-post'], ['Enter fields', ''], ['CRUD', 'y'], ['Route name', '']]);
  const appRoute = fs.readFileSync(path.join(projectDir, 'src', 'routes', 'app.route.ts'), 'utf8');
  check('naf model registers the route', appRoute.includes("import blogPostRoute from './blog-post.route'") && appRoute.includes('...blogPostRoute'));

  await runCli(projectDir, ['controller'], [['Controller', 'article'], ['Route name', ''], ['CRUD', 'y'], ['Model name', 'post'], ['Enter fields', 'title:string!']]);
  const articleController = fs.readFileSync(path.join(projectDir, 'src', 'controllers', 'article.controller.ts'), 'utf8');
  check('naf controller uses the chosen model', articleController.includes("model: 'post'") && fs.existsSync(path.join(projectDir, 'src', 'models', 'post.model.ts')));

  // 2. Generate resources without prompts, the way Claude Code runs naf
  const planFile = path.join(workDir, 'plan.json');
  fs.writeFileSync(planFile, JSON.stringify({ resources: [
    { name: 'category', fields: 'name:string!' },
    { name: 'product', fields: 'name:string! price:number! inStock:boolean releasedAt:date category:ref(category)' }
  ] }));
  let result = await runJson(projectDir, ['plan', planFile]);
  check('naf plan creates several models', result.code === 0 && result.json?.added?.includes('src/models/product.model.ts') && result.json?.added?.includes('src/routes/category.route.ts'), result.output);
  check('naf suggests the typecheck command', result.json?.typecheck === 'npm run typecheck', result.output);
  const productModel = fs.readFileSync(path.join(projectDir, 'src', 'models', 'product.model.ts'), 'utf8');
  check('the model has the fields', productModel.includes('price: { type: Number, required: true }') && productModel.includes("category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' }"), productModel);

  result = await runJson(projectDir, ['model', 'tag', '--fields', 'label:string!', '--crud']);
  check('naf model works with flags', result.code === 0 && result.json?.modified?.includes('src/routes/app.route.ts'), result.output);

  // add a custom action the way the skill describes it
  const tagController = path.join(projectDir, 'src', 'controllers', 'tag.controller.ts');
  const tagRoute = path.join(projectDir, 'src', 'routes', 'tag.route.ts');
  const controllerSource = fs.readFileSync(tagController, 'utf8');
  const routeSource = fs.readFileSync(tagRoute, 'utf8');
  check('the templates provide the helpers for custom actions', controllerSource.includes('const { actions, model, toBoom, found, parseQuery, boom }') && routeSource.includes('const { routes, handler, path, schema }'), controllerSource + routeSource);
  fs.writeFileSync(tagController, controllerSource.replace('\nexport default actions', `
const baseTest = actions.test
actions.test = async (req: any, reply: any) => \`wrapped: \${await baseTest(req, reply)}\`

actions.byLabel = async (req: any, reply: any) => {
  try {
    return found(await model.findOne({ label: req.params.label }))
  } catch (err) {
    throw toBoom(err)
  }
}

export default actions`));
  fs.writeFileSync(tagRoute, routeSource.replace('\nexport default routes', '\nexport default [...routes.filter((route: any) => route.method !== \'DELETE\'), { method: \'GET\', url: `${path}/by-label/:label`, handler: handler.byLabel }]'));

  result = await runJson(projectDir, ['list']);
  check('naf list shows the models', ['blog-post', 'post', 'category', 'product', 'tag'].every((name) => result.json?.models?.includes(name)), result.output);

  fs.writeFileSync(planFile, JSON.stringify({ resources: [{ name: 'order', fields: 'total:number!' }, { name: 'line', fields: 'order:ref(missing)' }] }));
  result = await runJson(projectDir, ['plan', planFile]);
  check('a plan with a mistake generates nothing', result.code === 1 && result.json?.error?.includes('missing') && !fs.existsSync(path.join(projectDir, 'src', 'models', 'order.model.ts')), result.output);
  result = await runJson(projectDir, ['model', 'tag', '--crud']);
  check('an existing model is refused', result.code === 1 && result.json?.error?.includes('already exists'), result.output);
  result = await runJson(projectDir, ['model']);
  check('a missing name fails instead of waiting for a prompt', result.code === 1, result.output);
  result = await runJson(projectDir, ['model', 'setting', '--fields', 'sort:number']);
  check('sort is refused as a field name', result.code === 1 && result.json?.error?.includes('sort'), result.output);
  result = await runJson(projectDir, ['model', 'setting', '--fields', 'save:string']);
  check('a name reserved by mongoose is refused', result.code === 1 && result.json?.error?.includes('mongoose'), result.output);
  result = await runJson(projectDir, ['model', 'app', '--crud']);
  check('a name clashing with an existing file generates nothing', result.code === 1 && result.json?.error?.includes('src/routes/app.route.ts') && !fs.existsSync(path.join(projectDir, 'src', 'models', 'app.model.ts')), result.output);
  fs.writeFileSync(planFile, JSON.stringify({ resources: [{ name: 'health-check' }] }));
  result = await runJson(projectDir, ['plan', planFile]);
  check('a plan clashing with an existing file generates nothing', result.code === 1 && result.json?.error?.includes('health-check.route.ts') && !fs.existsSync(path.join(projectDir, 'src', 'models', 'health-check.model.ts')), result.output);
  fs.writeFileSync(planFile, JSON.stringify({ resources: [{ name: 'setting', fields: 5 }] }));
  result = await runJson(projectDir, ['plan', planFile]);
  check('a plan with fields that are not text explains it', result.code === 1 && result.json?.error?.includes('fields must be text'), result.output);
  result = await runJson(projectDir, ['model', 'setting', '--nope']);
  check('an argument error is still JSON', result.code === 1 && typeof result.json?.error === 'string', result.output);
  result = await runJson(projectDir, ['model', 'setting', 'extra']);
  check('an extra argument is refused', result.code === 1 && result.json?.error?.includes('extra') && !fs.existsSync(path.join(projectDir, 'src', 'models', 'setting.model.ts')), result.output);

  fs.rmSync(path.join(projectDir, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'AGENTS.md'), 'my own instructions\n');
  result = await runJson(projectDir, ['skill']);
  check('naf skill adds the skill', result.code === 0 && fs.existsSync(path.join(projectDir, '.claude', 'skills', 'naf', 'SKILL.md')), result.output);
  check('naf skill keeps an existing AGENTS.md', result.json?.agents === 'kept' && fs.readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8') === 'my own instructions\n', result.output);
  fs.rmSync(path.join(projectDir, 'AGENTS.md'));
  result = await runJson(projectDir, ['skill']);
  check('naf skill adds a missing AGENTS.md', result.json?.agents === 'added' && fs.existsSync(path.join(projectDir, 'AGENTS.md')), result.output);

  // 3. Install and type-check
  run('pnpm install', projectDir);
  run('pnpm typecheck', projectDir);
  check('the generated project type-checks', true);
  run('pnpm test', projectDir);
  check('the test script of the project runs the type check', true);

  // 4. Start the server and check the routes
  await startServer();
  let res = await request('GET', '/');
  check('GET / returns 200', res.status === 200 && res.text === 'API Server is running!', `${res.status} ${res.text}`);
  res = await request('GET', '/blog-posts/test');
  check('GET /blog-posts/test returns 200', res.status === 200, `${res.status} ${res.text}`);
  res = await request('GET', '/documentation/json');
  const paths = Object.keys(res.json?.paths || {});
  check('Swagger lists the CRUD routes', paths.includes('/blog-posts') && paths.includes('/blog-posts/{id}') && paths.includes('/articles'), paths.join(', '));
  check('Swagger lists the custom action', paths.includes('/tags/by-label/{label}'), paths.join(', '));
  res = await request('GET', '/tags/test');
  check('a wrapped default action keeps its behavior', res.status === 200 && res.text === 'wrapped: tag works!!!', `${res.status} ${res.text}`);
  res = await request('DELETE', '/tags/000000000000000000000000');
  check('a removed default route is gone', res.status === 404 && res.text.includes('Route DELETE'), `${res.status} ${res.text}`);
  res = await request('GET', '/blog-posts/not-an-id');
  check('GET with an invalid id returns 400', res.status === 400, `${res.status} ${res.text}`);
  res = await request('POST', '/blog-posts', {});
  check('POST without a name returns 400', res.status === 400, `${res.status} ${res.text}`);
  res = await request('POST', '/products', { name: 'x' });
  check('POST without a required field returns 400', res.status === 400 && res.text.includes('price'), `${res.status} ${res.text}`);
  res = await request('POST', '/products', { name: 'x', price: 1, releasedAt: 'not a date' });
  check('POST with an invalid date returns 400', res.status === 400 && res.text.includes('releasedAt'), `${res.status} ${res.text}`);
  res = await request('POST', '/products', { name: 'x', price: 1, category: 'not-an-id' });
  check('POST with an invalid ref returns 400', res.status === 400 && res.text.includes('category'), `${res.status} ${res.text}`);
  res = await request('GET', '/products?colour=red');
  check('an unknown filter returns 400', res.status === 400 && res.text.includes('colour'), `${res.status} ${res.text}`);
  res = await request('GET', '/products?price=cheap');
  check('a filter with a wrong type returns 400', res.status === 400 && res.text.includes('price'), `${res.status} ${res.text}`);
  res = await request('GET', '/products?price=%20');
  check('a blank number filter returns 400', res.status === 400 && res.text.includes('price'), `${res.status} ${res.text}`);
  res = await request('POST', '/products', { name: 'x', price: null });
  check('null for a required field returns 400', res.status === 400 && res.text.includes('price'), `${res.status} ${res.text}`);
  res = await request('GET', '/products?sort=-colour');
  check('an unknown sort field returns 400', res.status === 400 && res.text.includes('colour'), `${res.status} ${res.text}`);

  // 5. CRUD actions against a real database
  if (!mongoUri) {
    console.log('skip CRUD checks, set MONGODB_URI to run them');
    return;
  }
  res = await request('POST', '/blog-posts', { name: 'first', unknown: 'removed' });
  const id = res.json?._id;
  check('POST creates an item with 201', res.status === 201 && res.json?.name === 'first', `${res.status} ${res.text}`);
  check('POST removes unknown properties', res.json && !('unknown' in res.json), res.text);
  res = await request('GET', `/blog-posts/${id}`);
  check('GET by id returns the item', res.status === 200 && res.json?._id === id, `${res.status} ${res.text}`);
  res = await request('PUT', `/blog-posts/${id}`, { name: 'second' });
  check('PUT updates the item', res.status === 200 && res.json?.name === 'second', `${res.status} ${res.text}`);
  res = await request('GET', '/blog-posts');
  check('GET lists the item', res.status === 200 && Array.isArray(res.json) && res.json.some((item) => item._id === id), `${res.status} ${res.text}`);
  res = await request('DELETE', `/blog-posts/${id}`);
  check('DELETE removes the item', res.status === 200 && res.json?._id === id, `${res.status} ${res.text}`);
  res = await request('GET', `/blog-posts/${id}`);
  check('GET a deleted item returns 404', res.status === 404, `${res.status} ${res.text}`);
  res = await request('PUT', `/blog-posts/${id}`, { name: 'third' });
  check('PUT a deleted item returns 404', res.status === 404, `${res.status} ${res.text}`);
  res = await request('POST', '/tags', { label: 'news' });
  const tagId = res.json?._id;
  res = await request('GET', '/tags/by-label/news');
  check('a custom action returns its item', res.status === 200 && res.json?._id === tagId, `${res.status} ${res.text}`);
  res = await request('GET', '/tags/by-label/missing');
  check('a custom action returns 404 with found()', res.status === 404, `${res.status} ${res.text}`);
  res = await request('POST', '/categories', { name: 'Books' });
  const categoryId = res.json?._id;
  res = await request('POST', '/products', { name: 'Guide', price: 9.5, inStock: true, releasedAt: '2026-10-01T00:00:00.000Z', category: categoryId });
  check('POST stores every field type', res.status === 201 && res.json?.price === 9.5 && res.json?.inStock === true && res.json?.category === categoryId && res.json?.releasedAt?.startsWith('2026-10-01'), `${res.status} ${res.text}`);
  await request('POST', '/products', { name: 'Atlas', price: 20, inStock: false });
  await request('POST', '/products', { name: 'Map', price: 5, inStock: true });
  const names = async (url) => {
    const list = await request('GET', url);
    return Array.isArray(list.json) ? list.json.map((item) => item.name).join(',') : `${list.status} ${list.text}`;
  };
  let got = await names('/products?sort=price');
  check('index sorts ascending', got === 'Map,Guide,Atlas', got);
  got = await names('/products?sort=-price');
  check('index sorts descending', got === 'Atlas,Guide,Map', got);
  got = await names('/products?inStock=true&sort=price');
  check('index filters a boolean', got === 'Map,Guide', got);
  got = await names('/products?price=20');
  check('index filters a number', got === 'Atlas', got);
  got = await names(`/products?category=${categoryId}`);
  check('index filters a ref', got === 'Guide', got);
  const map = (await request('GET', '/products?name=Map')).json?.[0];
  res = await request('PUT', `/products/${map?._id}`, { inStock: null });
  check('null clears an optional field', res.status === 200 && res.json?.inStock === null && res.json?.price === 5, `${res.status} ${res.text}`);
};

try {
  await main();
} catch (err) {
  check('smoke test finished', false);
  console.error(err.message);
} finally {
  // wait for the server to exit, Windows keeps its files locked until then
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once('exit', resolve));
    server.kill();
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5000))]);
  }
  try {
    fs.rmSync(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    console.log(`Could not remove ${workDir}`);
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
