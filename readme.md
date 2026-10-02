# Naf CLI 
The CLI helps to create a Node API application with TypeScript, MongoDB, Fastify and Swagger.

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
[Claude Code skill]      | `naf skill`

Names must be lowercase kebab-case, for example `blog-post`. Controllers can also be given as a relative path, for example `admin/blog-post`.

Models have fields such as `title:string! price:number author:ref(user)`, where `!` means required. The list route of every model filters and sorts, e.g. `GET /products?inStock=true&sort=-price`. Every command also runs without prompts when the name is given, for example:

`naf init shop --db shopdb`

`naf model post --fields "title:string! body:string" --crud`

Add `--json` for a JSON output. The readme of the generated project describes every option, and `naf help` lists them.

#### Using with Claude Code

Every new project includes a Claude Code skill, so you can ask Claude Code in your own language, for example "create an API to manage products with a name, price and stock". Claude Code then runs the `naf` commands instead of writing the files by hand, which uses fewer tokens and keeps the generated code consistent. Run `naf skill` in an existing project to add or update the skill.

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
