import {
  rest,
  RestHandler,
  RestRequest,
  ResponseResolver,
  DefaultBodyType,
  RestContext,
} from "msw";
import { joinURL } from "ufo";

type MaybePromise<T> = Promise<T> | T;

type RestBuilder<
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  ResponseData = any,
  RequestBody extends DefaultBodyType = DefaultBodyType,
> = {
  basePath: string;
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  statusCode: number;
  delay?: number;
  resolver(req: RestRequest<RequestBody>): MaybePromise<ResponseData>;
  onRequest?: ResponseResolver<RestRequest<RequestBody>, RestContext>;
};

export const defineBaseBuilder = <
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  ResponseData = any,
  RequestBody extends DefaultBodyType = DefaultBodyType,
>(
  builder: Partial<RestBuilder>,
): RestBuilder<ResponseData, RequestBody> => ({
  basePath: "",
  path: "",
  method: "get",
  statusCode: 200,
  resolver: () => {},
  ...builder,
});

export const defineBuilder = <
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  ResponseData = any,
  RequestBody extends DefaultBodyType = DefaultBodyType,
>(
  builder: RestBuilder<ResponseData, RequestBody>,
) => builder;

export function createRestHandler<ResponseData, RequestBody extends DefaultBodyType>(
  builder: RestBuilder<ResponseData, RequestBody>,
): RestHandler {
  const responseResolver: ResponseResolver<RestRequest<RequestBody>, RestContext> = async (
    req,
    res,
    ctx,
  ) => {
    builder.onRequest?.(req, res, ctx);
    return res(
      ctx.status(builder.statusCode),
      ctx.delay(builder.delay ?? 0),
      ctx.json(await builder.resolver(req)),
    );
  };

  return rest[builder.method](joinURL(builder.basePath, builder.path), responseResolver);
}
