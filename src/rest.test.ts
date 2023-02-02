import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { createRestHandler } from "./rest";

describe("rest handler test", () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("define get handler", async () => {
    const requestSpy = vi.fn();
    const handler = createRestHandler({
      basePath: "https://example.com/api",
      path: "/users",
      method: "get",
      statusCode: 200,
      onRequest: (req) => {
        requestSpy(req);
      },
      resolver: () => {
        return { id: 1, name: "John" };
      },
    });
    server.use(handler);

    // expect(requestSpy).toHaveBeenCalledWith({});
    expect(await fetch("https://example.com/api/users").then((r) => r.text())).toStrictEqual({
      id: 1,
      name: "John",
    });
  });
});
