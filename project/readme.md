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
`npm run typecheck`

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

#### The system will ask you enter a model name, for example `blog-post`:

 * Your model named `blog-post.model.ts` will be generated in src/models
 * If you choose to create CRUD actions and routing, a controller, route and schema named `blog-post` will be generated too

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

If you choose to create CRUD actions, the system will also ask for a model name and generate the model if it does not exist yet.

### You can find all possible blueprints in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`

`Note that, Your models always generated in src/models`
