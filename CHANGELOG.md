# Changelog

## 2.0.0 (not released yet)

Naf 2 generates a TypeScript project, runs every command without prompts when needed, and works with AI coding agents such as Claude Code.

### Breaking changes

* The CLI needs Node.js 22.13 or later, and generated projects need Node.js 20.19 or later
* The CLI is an ES module
* Generated projects are TypeScript instead of JavaScript, with a new layout and new dependencies: Fastify 5, Mongoose 9, `@fastify/swagger` 9, `@hapi/boom` 10, TypeScript 7 and tsx
* Projects created with naf 1.x can't be upgraded in place. Create a new project and move your code into it
* Routes use a proper plural, e.g. `/categories` instead of `/categorys`
* Model and field names must be lower case kebab-case and camelCase, and `sort`, `id` and the names mongoose reserves (`save`, `isNew`, `errors`, ...) are refused as field names

### Added

* Fields for models and request schemas: `string`, `number`, `boolean`, `date` and `ref(<model>)`, with `!` for required, in the prompts and with `--fields`
* Every command runs without prompts when its name is given, e.g. `naf model post --fields "title:string!" --crud`, with `--json` output and exit code 1 on failure
* `naf plan` creates several models with CRUD actions from a JSON file, and generates nothing when the plan has a mistake
* `naf list` shows the models and controllers
* `naf skill` adds or updates the Claude Code skill and `AGENTS.md` of a project
* New projects include a Claude Code skill and an `AGENTS.md` for other AI coding agents
* The list route of every model filters by exact field values and sorts, e.g. `?inStock=true&sort=-price,name`
* Request validation for CRUD routes: invalid bodies and ids return 400, unknown body fields are removed
* Correct status codes: 201 on create, 400 for invalid input, 404 for missing items
* `BaseController` returns `toBoom`, `found` and `parseQuery` for custom actions, and the templates show how to add or change actions
* `PORT`, `HOST` and `MONGODB_URI` environment variables
* `npm test` runs the type check, and `npm run typecheck` does the same
* The CLI output names the type check command of the project's package manager
* A smoke test that runs on Windows, macOS and Linux with Node.js 22 and 24 on every pull request

### Changed

* Generated files are only written when none of them exist yet, so a command does everything or nothing
* Swagger "Try it out" uses the address of the server instead of `localhost` on port 80
* `null` in a request body clears an optional field, and is refused for a required one
* MongoDB connection errors are logged with the logger of the app
* Paths in the CLI output are relative to the current folder

### Fixed

* Kebab-case names such as `blog-post` produced an invalid import in `app.route.ts`
* `naf controller` with CRUD actions used the controller name instead of the chosen model
* Prompt validation failed every second time
* Nested controllers such as `admin/report` could be generated in the wrong folder
* New routes were not registered when `app.route.ts` had Windows (CRLF) line endings
* Generated projects had no `.gitignore` when naf was installed from npm

### Removed

* The unused `fs`, `tslint`, `fastify-mongodb`, `ts-node` and `nodemon` dependencies
