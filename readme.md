# Naf CLI 
The CLI helps to create a Node API application with MongoDB, Fastify and Swagger.

## Setting up

#### 1. Installation
Firstly, install it with:

`npm install -g @vixnguyen/naf`

Now you can run naf by simply doing:

`naf`

#### 2. Project Initial
The Naf CLI makes it easy to create an application that already works, right out of the box. It already follows our best practices.

`naf init`

## Development

#### 1. Prerequisites
- NodeJS
- MongoDB

#### 2. Code generating

After a new project initialized, at the root folder of your project, you can generate controllers, routes, schemas and models with a simple command in the table below:

Scaffold  | Usage
---       | ---
[Model]      | `naf model`
[Controller, Route, Schema]      | `naf controller`

> Note that the generating script only support when you run it at the root folder of your project.

#### 3. Run

#### Install dependencies
`npm install`

#### Serve with hot reload at localhost:0202
`npm start`
