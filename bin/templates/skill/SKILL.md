---
name: naf
description: Create API resources (models with CRUD routes, controllers, request schemas) in this Naf project. Use when the user asks, in any language, for new data, resources, endpoints or fields.
---

Use the naf CLI from the project root instead of writing these files by hand. If `naf` is not found, use `npx @vixnguyen/naf` instead.

- See what exists: `naf list --json`
- New model with CRUD routes: `naf model <name> --fields "<fields>" --crud --json`
- Several models at once (preferred): write `{"resources":[{"name":"post","fields":"title:string! author:ref(user)"}]}` to a file and run `naf plan <file> --json`. Nothing is generated if the plan has a mistake. Delete the file afterwards.
- Controller without a model: `naf controller <name or folder/name> --json`

Fields: space separated `name:type`, type is `string`, `number`, `boolean`, `date` or `ref(<model>)`, `!` means required. Do not add `id`, it is automatic.
Names: English, singular, kebab-case for models (`order-item`), camelCase for fields (`dueDate`), even when the user writes in another language. Routes are the plural of the model (`/order-items`, `/categories`), add `--route <route>` or `"route"` in the plan for another one.

naf never overwrites files. To change an existing model, edit `src/models/<name>.model.ts` and the body in `src/schemas/<name>.schema.ts` by hand.
After generating, run `npm run typecheck`, then tell the user in their language which routes now exist.
