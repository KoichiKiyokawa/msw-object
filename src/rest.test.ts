import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { createRestHandler } from "./rest";
import axios from "axios";

describe("rest handler test", () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("define get handler", async () => {
    const requestUrlSpy = vi.fn();
    const requestMethodSpy = vi.fn();
    const handler = createRestHandler({
      basePath: "https://example.com/api",
      path: "/users",
      method: "get",
      statusCode: 200,
      onRequest: (req) => {
        requestUrlSpy(req.url.toString());
        requestMethodSpy(req.method);
      },
      resolver: () => {
        return { id: 1, name: "John" };
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
      basePath: "https://example.com/api",
      path: "/users",
      method: "post",
      statusCode: 201,
      onRequest: async (req) => {
        requestUrlSpy(req.url.toString());
        requestBodySpy(await req.json());
        requestMethodSpy(req.method);
      },
      resolver: () => {
        return { id: 1, name: "John" };
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
