import { rest, RestHandler, RestRequest, ResponseResolver } from "msw";
import { joinURL } from "ufo";

type MaybePromise<T> = Promise<T> | T;

export type RestBuilder<ResponseData> = {
  basePath: string;
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  statusCode: number;
  delay?: number;
  resolver(req: RestRequest): MaybePromise<ResponseData>;
  onRequest?: ResponseResolver;
};

export function createRestHandler<ResponseData>(builder: RestBuilder<ResponseData>): RestHandler {
  return rest[builder.method](
    joinURL(builder.basePath, builder.path),
    async (req: RestRequest, res: any, ctx: any) => {
      builder.onRequest?.(req, res, ctx);
      return res(
        ctx.status(builder.statusCode),
        ctx.delay(builder.delay ?? 0),
        ctx.json(await builder.resolver(req)),
      );
    },
  );
}
