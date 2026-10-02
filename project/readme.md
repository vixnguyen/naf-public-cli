# Naf API
A Node API application with TypeScript, MongoDB, Fastify and Swagger.

## Prerequisites
- Nodejs 20.19 or later
- MongoDB, running on `localhost`

## MongoDB
The app connects to `mongodb://localhost/<database name>` on the default port `27017`. The host and database name are set in `src/config/db.ts`, and the database name is the one you entered during `naf init`. MongoDB creates the database the first time data is saved, so you don't need to create it yourself.

Start a local MongoDB with one of these, on Windows, macOS or Linux:

> With Docker:
`docker run -d --name mongodb -p 27017:27017 mongo`

> With the official installer:
Download MongoDB Community Server from the [MongoDB download page](https://www.mongodb.com/try/download/community) and follow the [installation guide](https://www.mongodb.com/docs/manual/installation/) for your OS.

If MongoDB is not running, the server still starts, and `/` and the `/test` routes still respond. Routes that read or write data fail after about 10 seconds, and the connection error is printed in the console.

## Build Setup

#### Install dependencies
`npm install`

#### Serve with hot reload at localhost:2101
`npm start`

The Swagger documentation is available at `localhost:2101/documentation`.

The database settings are in `src/config/db.ts`.

#### Type-check the project
`npm run typecheck`, or `npm test` which runs the same check

#### Environment variables
You can override the defaults without changing the code:

Variable  | Default | Usage
---       | ---     | ---
`PORT`        | `2101` | Port of the server
`HOST`        | `localhost` | Address the server listens on, use `0.0.0.0` to accept connections from other machines or containers
`MONGODB_URI` | `mongodb://localhost/<database name>` | Full MongoDB connection string, for example a remote database

## Scripts
You can use the `naf` command for code generating:

### For model generating, run command:
`naf model`

#### The system will ask you enter a model name, for example `blog-post`, and its fields:

 * Your model named `blog-post.model.ts` will be generated in src/models
 * If you choose to create CRUD actions and routing, a controller, route and schema named `blog-post` will be generated too

#### Fields
Fields are written as `name:type`, separated by spaces, for example `title:string! price:number author:ref(user)`:

Type  | Usage
---   | ---
`string` | Text
`number` | Amounts and counts
`boolean` | Yes/no flags
`date` | Dates and times, sent as ISO strings such as `2026-10-01T00:00:00.000Z`
`ref(<model>)` | Id of an item of another model, for example `author:ref(user)`

A trailing `!` makes the field required. The default is `name:string!`. The fields are used for the model and for the request schema, so invalid requests return 400. Send `null` to clear an optional field. `sort` can't be a field name, it is used for sorting, and neither can the names mongoose reserves, such as `save`, `isNew` or `errors`.

#### Filter and sort the list
The list route of a model with CRUD, e.g. `GET /products`, filters by any field of the model and sorts by one or more fields:

Request  | Result
---      | ---
`GET /products?inStock=true` | Products in stock
`GET /products?category=<id>&price=20` | Products of a category with a price of 20, every filter must match
`GET /products?sort=price` | Cheapest first
`GET /products?sort=-price,name` | Most expensive first, then by name

A filter matches the exact value, converted to the type of the field. Numbers are written as `20` or `-2.5`, dates as `2026-10-01T00:00:00.000Z`. An unknown field or a wrong value, e.g. `?price=cheap`, returns 400. The filters and `sort` are listed in the Swagger documentation.

To change the list, e.g. to only return active items, replace `index` in the controller and use `parseQuery(req.query)` to keep the filters and sort, see the example in the controller.

### For controller generating, run command:
`naf controller`

#### The system will ask you enter a controller name, then you can:

> Entering the alias: 
`new-controller-name`

 * Your controller named `new-controller-name.controller.ts` will be generated in src/controllers
 * Your route named `new-controller-name.route.ts` will be generated in src/routes
 * Your schema named `new-controller-name.schema.ts` will be generated in src/schemas

> Or entering relative path generation:
`admin/feature/new-controller-name`

 * Your controller will be generated in src/controllers/admin/feature
 * Your route will be generated in src/routes/admin/feature
 * Your schema will be generated in src/schemas/admin/feature

Routes generated in the root of src/routes are added to `src/routes/app.route.ts` automatically. Routes in a nested folder must be imported there by hand.

If you choose to create CRUD actions, the system will also ask for a model name and its fields, and generate the model if it does not exist yet.

### Without prompts
Give the name as an argument to skip the prompts, which is useful in scripts:

`naf model post --fields "title:string! body:string author:ref(user)" --crud`

`naf controller admin/report --route admin/reports`

`naf controller shop --model product --fields "name:string! price:number"`

Add `--json` to any command for a JSON output, and see `naf help` for all options. A command which fails exits with code 1.

### Several models at once
Write a plan file and run `naf plan plan.json`, or `naf plan -` to read it from the input:

```json
{"resources": [
  {"name": "category", "fields": "name:string!"},
  {"name": "product", "fields": "name:string! price:number! category:ref(category)"}
]}
```

Every model gets CRUD actions and routes, unless it has `"crud": false`. A model can also set `"route"`. Nothing is generated if the plan has a mistake.

### List the models and controllers
`naf list`

### Working with Claude Code
Your project includes a Claude Code skill in `.claude/skills/naf/SKILL.md`, so Claude Code runs the `naf` commands for you instead of writing the files by hand. This uses fewer tokens and keeps the code the same as `naf` generates it.

1. Run `claude` in this folder.
2. Ask for what you need in your own language, for example "create an API for products with a name, a required price and a category", "add an action to find a product by its name" or "don't allow deleting products". Name the fields of each resource, otherwise Claude Code asks for them first.
3. Allow the `naf` commands when Claude Code asks for permission. It then checks the code and lists the new routes.

Other AI coding agents, such as Codex, Cursor, GitHub Copilot or Gemini CLI, read `AGENTS.md`, which points them to the same commands.

After updating naf, run `naf skill` to update the skill. It also adds `AGENTS.md` when it is missing, and keeps your own.

### You can find all possible blueprints in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`
[Several models with CRUD]      | `naf plan <file>`
[List of models and controllers]      | `naf list`
[Claude Code skill and AGENTS.md]      | `naf skill`

`Note that, Your models always generated in src/models`
