import { Context } from 'koa';
import { undefined as isUndefined, string as isString } from '@zcorky/is';

export interface Options {
  /**
   * origin `Access-Control-Allow-Origin`, default is request Origin header
   */
  allowMethods?: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD')[];

  /**
   * exposeHeaders `Access-Control-Expose-Headers`
   */
  exposeHeaders?: string[];
  
  /**
   * allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
   */
  allowHeaders?: string[];
  
  /**
   * maxAge `Access-Control-Max-Age` in seconds
   */
  maxAge?: number;

  /**
   * credentials `Access-Control-Allow-Credentials`
   */
  credentials?: boolean;

  /**
   * keepHeadersOnError Add set headers to `err.header` if an error is thrown
   */
  keepHeadersOnError?: boolean;

  /**
   * request Origin header
   */
  origin?: string | ((ctx: Context) => string | false);
}

const DEFAULTS: Partial<Options> = {
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
};

export default (options?: Options) => {
  const _options = Object.assign({}, DEFAULTS, options);

  const allowMethods = _options.allowMethods!.join(',');
  const allowHeaders = !!_options.allowHeaders && _options.allowHeaders!.join(',');
  const exposeHeaders = !!_options.exposeHeaders && _options.exposeHeaders!.join(',');
  const maxAge = !!_options.maxAge && String(_options.maxAge);
  const credentials = !!_options.credentials;
  const keepHeadersOnError = !!_options.keepHeadersOnError

  return async function koexCors(ctx: Context, next: () => Promise<void>) {
    const requestOrigin = ctx.get('Origin');

    // Always set Vary header
    // https://github.com/rs/cors/issues/10
    ctx.vary('Origin');

    if (!requestOrigin) {
      return await next();
    }

    const origin = isUndefined(_options.origin)
      ? requestOrigin
      : isString(_options.origin)
        ? _options.origin
        : await _options.origin(ctx);

    if (!origin) {
      return await next();
    }

    // @preflight
    if (ctx.method === 'OPTIONS') {
      // if there is no Access-Control-Request-Method header or if parsing.failed,
      // do not set any additional headers and terminate this set of steps,
      // that is, it is not preflight request, ignore it.
      // The request is outside the scope of this specification.
      if (!ctx.get('Access-Control-Request-Method')) {
        return await next();
      }

      ctx.set('Access-Control-Allow-Origin', origin);

      if (credentials) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      if (maxAge) {
        ctx.set('Access-Control-Max-Age', maxAge);
      }

      ctx.set('Access-Control-Allow-Methods', allowMethods);

      if (allowHeaders) {
        ctx.set('Access-Control-Allow-Headers', allowHeaders);
      } else {
        ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'));
      }

      ctx.status = 204;
      return ;
    }

    // Simple Cross-Origin Request, Actual Request, and Redirects
    const headersSet = {};

    const set = (key: string, value: string) => {
      ctx.set(key, value);
      headersSet[key] = value;
    };

    set('Access-Control-Allow-Origin', origin);

    if (credentials) {
      set('Access-Control-Allow-Credentials', 'true');
    }

    if (exposeHeaders) {
      set('Access-Control-Expose-Headers', exposeHeaders);
    }

    if (!keepHeadersOnError) {
      return await next();
    }

    return next().catch(err => {
      err.headers = Object.assign({}, err.headers, headersSet);
      throw err;
    });
  };
};
