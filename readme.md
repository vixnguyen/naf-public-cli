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

#### 2. Code generating

After a new project initialized, at the root folder of your project, you can generate controllers, routes, schemas and models with a simple command in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`

Names must be lowercase kebab-case, for example `blog-post`. Controllers can also be given as a relative path, for example `admin/blog-post`.

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
