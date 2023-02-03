# msw-object

> Reusable msw mock definition.

[![codecov](https://codecov.io/gh/KoichiKiyokawa/type-safe-path/branch/main/graph/badge.svg?token=61F6FRPXKN)](https://codecov.io/gh/KoichiKiyokawa/type-safe-path)

## Usage

```sh
npm i -D @kiyoshiro/msw-object
```

<table>
<thead>
<th>This library</th>
<th>Original msw</th>
</th>
</thead>
<tbody>
<tr>
<td>

```ts
import {
  defineBaseRestBuilder,
  createRestHandler,
} from "@kiyoshiro/msw-object";
import { setupServer } from "msw";

const baseBuilder = defineBaseRestBuilder({
  basePath: "http://localhost:3000",
  delay: 500, // set default delay as 500ms
});

// extends baseBuilder
const userShowBuilder = {
  ...baseBuilder,
  path: "/users/:id",
  resolve: () => ({ id: 1, name: "user1", age: 10 }),
};

// extends userShowBuilder
const userListBuilder = {
  ...userShowBuilder,
  path: "/users",
  resolve: () => [userShowBuilder.resolve()],
};

const builders = [userShowBuilder, userListBuilder];
setupServer(...builders.map(createRestHandler));
```

</td>

<td>

```ts
import { rest, setupServer } from "msw";

const userShowHandler = rest.get(
  "http://localhost:3000/users/:id",
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: 1, name: "user1", age: 10 }),
      ctx.delay(500)
    );
  }
);

// difficult to reuse userShowBuilder 😢
const userListHandler = rest.get(
  "http://localhost:3000/users",
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ id: 1, name: "user1", age: 10 }]),
      ctx.delay(500)
    );
  }
);

setupServer(userShowHandler, userListHandler);
```

</td>
</tr>
</tbody>
</table>

## Features

TODO...

## Abstract

TODO
