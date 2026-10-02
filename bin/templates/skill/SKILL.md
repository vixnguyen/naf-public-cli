---
name: naf
description: Create API resources (models with CRUD routes, controllers, request schemas) in this Naf project. Use when the user asks, in any language, for new data, resources, endpoints or fields.
---

Use the naf CLI from the project root instead of writing these files by hand. If `naf` is not found, use `npx @vixnguyen/naf` instead.

If the user names a resource without saying its fields, ask before generating anything: which fields it should have, or whether to create it with only a required `name` field. Ask one short question covering all such resources, in the user's language. When the fields are given, generate right away without asking.

- See what exists: `naf list --json`
- New model with CRUD routes: `naf model <name> --fields "<fields>" --crud --json`
- Several models at once (preferred): create `plan.json` with your file writing tool (not a shell heredoc), e.g. `{"resources":[{"name":"post","fields":"title:string! author:ref(user)"}]}`, run `naf plan plan.json --json`, then delete `plan.json`. Nothing is generated if the plan has a mistake.
- Controller without a model: `naf controller <name or folder/name> --json`

naf prints one JSON line and exits with code 1 on failure, so run it on its own, without `echo $?` or other commands.

Fields: space separated `name:type`, type is `string`, `number`, `boolean`, `date` or `ref(<model>)`, `!` means required. Do not add `id`, it is automatic, and `sort` is reserved.
Names: English, singular, kebab-case for models (`order-item`), camelCase for fields (`dueDate`), even when the user writes in another language. Routes are the plural of the model (`/order-items`, `/categories`), add `--route <route>` or `"route"` in the plan for another one.

naf never overwrites files. To change an existing model, edit `src/models/<name>.model.ts` and the body in `src/schemas/<name>.schema.ts` by hand.

Custom action (anything besides CRUD), written by hand without reading `src/core`:
- `src/controllers/<name>.controller.ts`: take `actions, model, toBoom, found, parseQuery` from `new BaseController(...)`, add `actions.<action> = async (req: any, reply: any) => { try { return found(await model.findOne(...)) } catch (err) { throw toBoom(err) } }` before the export. `found` throws a 404 for null, `toBoom` a 400 for invalid data or ids.
- `src/routes/<name>.route.ts`: take `routes, handler, path` from `new BaseRoute(...)` and `export default [...routes, { method: 'GET', url: \`${path}/<action>\`, handler: handler.<action> }]`.
- Optional: add `<action>: { tags, summary, params }` to the export of `src/schemas/<name>.schema.ts` and `schema: schema.<action>` to the route.

Change a default action (`index`, `read`, `create`, `update`, `delete`) only in the controller: replace it (`actions.index = async (req: any, reply: any) => ...`) or wrap it (`const baseCreate = actions.create; actions.create = async (req: any, reply: any) => { ...; return baseCreate(req, reply) }`). Changing `handler` in the route file has no effect. To remove a default route, export `routes.filter((route: any) => route.method !== 'DELETE')` from the route file.

After generating, run the `typecheck` command from naf's JSON output, then tell the user in their language which routes now exist. Each model with CRUD has exactly `GET /<route>`, `GET /<route>/:id`, `POST /<route>`, `PUT /<route>/:id` and `DELETE /<route>/:id`. `GET /<route>` already filters by exact field values and sorts, e.g. `?inStock=true&category=<id>&sort=-price,name`, so don't write a custom action for that. To change the list, replace `index` and keep `const { filter, sort } = parseQuery(req.query)`.
