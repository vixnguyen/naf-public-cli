# Naf CLI 
The CLI helps to create a Node API application with TypeScript, MongoDB, Fastify and Swagger.

## Why naf

Naf started long before AI coding agents, to cut the time it takes to build a Node API. Agents now write that code in minutes, so saving time is no longer the point. What still matters is how much the agent has to write, read and fix. With naf, an agent runs one command for code that is already tested, instead of writing and debugging it. That saves tokens and money, and the result is the same every time. See the [benchmark](#benchmark).

You also get, without asking for it:

* **Guardrails:** naf refuses mistakes such as reserved names or links to unknown models, and a command does everything or nothing
* **Safe defaults:** unknown body fields are removed, ids are checked, and query injection is refused
* **Docs in sync:** one schema drives both the validation and the Swagger documentation
* **Every OS:** tested on Windows, macOS and Linux
* **Any agent, or none:** works with Claude Code, other agents through `AGENTS.md`, or by hand, with no API key

## Setting up

#### 1. Installation
Firstly, install it with:

`npm install -g @vixnguyen/naf`

Now you can run naf by simply doing:

`naf`

#### 2. Project Initial
The Naf CLI makes it easy to create an application that already works, right out of the box. It already follows our best practices.

`naf init`

The CLI will ask you for a project name and a database name, then create the project in a new folder named after the project.

## Development

#### 1. Prerequisites
- NodeJS 22.13 or later
- MongoDB, running on `localhost`

The generated project connects to `mongodb://localhost/<database name>`, using the database name you entered during `naf init`. To start a local MongoDB with Docker:

`docker run -d --name mongodb -p 27017:27017 mongo`

Or install MongoDB Community Server with the [official installer](https://www.mongodb.com/try/download/community) for Windows, macOS or Linux. The readme of the generated project has more details.

#### 2. Code generating

After a new project initialized, at the root folder of your project, you can generate controllers, routes, schemas and models with a simple command in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`
[Several models with CRUD]      | `naf plan <file>`
[List of models and controllers]      | `naf list`
[Claude Code skill and AGENTS.md]      | `naf skill`

Names must be lowercase kebab-case, for example `blog-post`. Controllers can also be given as a relative path, for example `admin/blog-post`.

Models have fields such as `title:string! price:number author:ref(user)`, where `!` means required. The list route of every model filters and sorts, e.g. `GET /products?inStock=true&sort=-price`. Every command also runs without prompts when the name is given, for example:

`naf init shop --db shopdb`

`naf model post --fields "title:string! body:string" --crud`

Add `--json` for a JSON output. The readme of the generated project describes every option, and `naf help` lists them.

#### Working with Claude Code

Every new project includes a Claude Code skill. Describe the API you want in your own language, and Claude Code runs the `naf` commands for you instead of writing the files by hand. This uses fewer tokens and keeps the code the same as `naf` generates it.

1. Create a project and open it in Claude Code:

   `naf init shop`

   `cd shop`

   `claude`

   Or let Claude Code create it: run `claude` in an empty folder and ask

   > Create a new API project named shop with `npx @vixnguyen/naf@2 init shop`, then follow its `.claude/skills/naf/SKILL.md`

   Always give the full package name `@vixnguyen/naf`. The npm package called `naf` is a different project.

2. Ask for what you need, for example:

   * "Create an API for products with a name, a required price, a stock quantity and a category"
   * "Tạo API quản lý đơn hàng có tổng tiền, trạng thái đã thanh toán và khách hàng"
   * "Add an action to find a product by its name"
   * "Don't allow deleting products"

   Name the fields of each resource. If you don't, Claude Code asks for them before creating anything. The code always uses English names, whatever language you write in.

3. Allow the `naf` commands when Claude Code asks for permission. It then checks the code with the `typecheck` script and lists the new routes.

4. Run the API as described in [Run](#3-run) and try the routes in the Swagger documentation.

Other AI coding agents, such as Codex, Cursor, GitHub Copilot or Gemini CLI, read the `AGENTS.md` of the project, which points them to the same commands. Ask them the same way.

After updating naf, run `naf skill` in your projects to update the skill. It also adds `AGENTS.md` when the project has none, and keeps an existing one. The skill works with projects created by naf 2.0 or later.

##### Benchmark

The same three prompts were run in Claude Code (Claude Opus 5.5), twice in a naf project and twice in the same TypeScript, Fastify, Mongoose and Swagger project without naf. The prompts created categories and products with CRUD, validation, filters, sorting and Swagger, then added a custom route and removed one. Every result passed the same 18 acceptance checks against MongoDB.

| Three prompts in total | With naf | Without naf |
|---|---|---|
| Cost | $0.35 | $1.11 |
| Output tokens | 3,760 | 23,050 |
| Agent turns | 19.5 | 51.5 |
| Time | 63 s | 258 s |

Creating the resources was about 5× cheaper with naf, and the later changes about 1.5× cheaper. These are averages of two sessions each (October 2026), so take them as an indication rather than a guarantee.

> Note that the generating script only support when you run it at the root folder of your project.

#### 3. Run

#### Install dependencies
`npm install`

#### Serve with hot reload at localhost:2101
`npm start`

The Swagger documentation is available at `localhost:2101/documentation`.

## Contributing

To try your local changes to the CLI, link it globally from the root of this repository:

`npm link`

The `naf` command now runs your working copy. Run `npm unlink -g @vixnguyen/naf` to go back to the published version.

#### Smoke test

`pnpm test` generates a project in a temporary folder, installs it with pnpm, type-checks it, starts the server and checks the generated routes. It needs [pnpm](https://pnpm.io/installation).

To also check the CRUD actions against a database, set `MONGODB_URI`, for example:

`MONGODB_URI=mongodb://127.0.0.1:27017/naf-smoke pnpm test`

On Windows PowerShell:

`$env:MONGODB_URI="mongodb://127.0.0.1:27017/naf-smoke"; pnpm test`

The smoke test runs on Windows, macOS and Linux with Node 22 and 24 for every pull request. The CRUD actions are only checked on Linux, where Docker is available for MongoDB.
