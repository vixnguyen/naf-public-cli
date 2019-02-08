# NFAG 
A Node API application with MongoDB, Fastify and Swagger.

## Prerequisites
- Nodejs
- MongoDB

## Build Setup

#### Install dependencies
`npm install`

#### Serve with hot reload at localhost:2020
`npm start`

## Scripts
You can use the `naf` command for code generating:

### For controller generating, run command:
`naf controller`

#### The system will ask you enter a controller name, then you can:

> Entering the alias: 
`new-controller-name`

 * Your controller named `new-controller-name.controller.js` will be generated in src/controllers
 * Your route names named `new-controller-name.route.js` will be generated in src/routes
 * Your schema named `new-controller-name.schema.js` will be generated in src/schemas

> Or entering relative path generation:
`admin/feature/new-controller-name`

 * Your controller will be generated in src/controllers/admin/feature
 * Your route will be generated in src/routes/admin/feature
 * Your schema will be generated in src/schemas/admin/feature

### You can find all possible blueprints in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`

`Note that, Your models always generated in src/models`
