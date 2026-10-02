/**
 * Smoke test for the CLI, it works on Windows, macOS and Linux
 * 1. Generate a project with `naf init` and a CRUD resource with `naf model`
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
 * Run a CLI command and answer its prompts
 * @param answers list of [text of the prompt, answer to type]
 */
const runCli = (cwd, command, answers) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [cli, command], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
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
  const timer = setTimeout(() => {
    child.kill();
    reject(new Error(`naf ${command} timed out, output:\n${output}`));
  }, 30000);
  child.on('close', (code) => {
    clearTimeout(timer);
    if (code === 0 && next === answers.length) {
      resolve(output);
    } else {
      reject(new Error(`naf ${command} failed with code ${code}, output:\n${output}`));
    }
  });
});

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

  // 1. Generate a project and a CRUD resource
  await runCli(workDir, 'init', [['Project name', 'demo'], ['Database name', 'demodb']]);
  check('naf init creates the project', fs.existsSync(path.join(projectDir, 'package.json')));
  check('naf init adds .gitignore', fs.existsSync(path.join(projectDir, '.gitignore')) && !fs.existsSync(path.join(projectDir, 'gitignore')));

  await runCli(projectDir, 'model', [['Model name', 'blog-post'], ['CRUD', 'y'], ['Route name', '']]);
  const appRoute = fs.readFileSync(path.join(projectDir, 'src', 'routes', 'app.route.ts'), 'utf8');
  check('naf model registers the route', appRoute.includes("import blogPostRoute from './blog-post.route'") && appRoute.includes('...blogPostRoute'));

  await runCli(projectDir, 'controller', [['Controller', 'article'], ['Route name', ''], ['CRUD', 'y'], ['Model name', 'post']]);
  const articleController = fs.readFileSync(path.join(projectDir, 'src', 'controllers', 'article.controller.ts'), 'utf8');
  check('naf controller uses the chosen model', articleController.includes("model: 'post'") && fs.existsSync(path.join(projectDir, 'src', 'models', 'post.model.ts')));

  // 2. Install and type-check
  run('pnpm install', projectDir);
  run('pnpm typecheck', projectDir);
  check('the generated project type-checks', true);

  // 3. Start the server and check the routes
  await startServer();
  let res = await request('GET', '/');
  check('GET / returns 200', res.status === 200 && res.text === 'API Server is running!', `${res.status} ${res.text}`);
  res = await request('GET', '/blog-posts/test');
  check('GET /blog-posts/test returns 200', res.status === 200, `${res.status} ${res.text}`);
  res = await request('GET', '/documentation/json');
  const paths = Object.keys(res.json?.paths || {});
  check('Swagger lists the CRUD routes', paths.includes('/blog-posts') && paths.includes('/blog-posts/{id}') && paths.includes('/articles'), paths.join(', '));
  res = await request('GET', '/blog-posts/not-an-id');
  check('GET with an invalid id returns 400', res.status === 400, `${res.status} ${res.text}`);
  res = await request('POST', '/blog-posts', {});
  check('POST without a name returns 400', res.status === 400, `${res.status} ${res.text}`);

  // 4. CRUD actions against a real database
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
};

try {
  await main();
} catch (err) {
  check('smoke test finished', false);
  console.error(err.message);
} finally {
  if (server) {
    server.kill();
  }
  try {
    fs.rmSync(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    console.log(`Could not remove ${workDir}`);
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
