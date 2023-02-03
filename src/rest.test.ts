import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { createRestHandler, defineBaseRestBuilder } from "./rest";
import axios from "axios";

// We use axios because msw does not support mocking fetch in Node 18.
// https://t-yng.jp/post/msw-node18-error

describe("rest handler test", () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const baseUserBuilder = defineBaseRestBuilder({
    basePath: "https://example.com/api",
    path: "/users",
    statusCode: 200,
    resolver: () => ({ id: 1, name: "John" }),
  });

  test("define get handler", async () => {
    const requestUrlSpy = vi.fn();
    const requestMethodSpy = vi.fn();
    const handler = createRestHandler({
      ...baseUserBuilder,
      method: "get",
      onRequest: (req) => {
        requestUrlSpy(req.url.toString());
        requestMethodSpy(req.method);
      },
    });
    server.use(handler);

    const result = await axios.get("https://example.com/api/users");
    expect(requestUrlSpy).toHaveBeenCalledWith("https://example.com/api/users");
    expect(requestMethodSpy).toHaveBeenCalledWith("GET");
    expect(result.status).toBe(200);
    expect(result.data).toStrictEqual({ id: 1, name: "John" });
  });

  test("define post handler", async () => {
    const requestUrlSpy = vi.fn();
    const requestBodySpy = vi.fn();
    const requestMethodSpy = vi.fn();
    const handler = createRestHandler({
      ...baseUserBuilder,
      method: "post",
      statusCode: 201,
      onRequest: async (req) => {
        requestUrlSpy(req.url.toString());
        requestBodySpy(await req.json());
        requestMethodSpy(req.method);
      },
    });
    server.use(handler);

    const result = await axios.post("https://example.com/api/users", { name: "John" });

    expect(requestUrlSpy).toHaveBeenCalledWith("https://example.com/api/users");
    expect(requestBodySpy).toHaveBeenCalledWith({ name: "John" });
    expect(requestMethodSpy).toHaveBeenCalledWith("POST");
    expect(result.status).toBe(201);
    expect(result.data).toStrictEqual({ id: 1, name: "John" });
  });
});
