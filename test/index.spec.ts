import * as Koa from 'koa';
import * as request from 'supertest';
import 'should';

import cors from '../src';

describe('koa static', () => {
  describe('default options', () => {
    const app = new Koa();
    app.use(cors());
    app.use(async ctx => {
      ctx.body = { foo: 'bar' };
    });

    it('should not set `Access-Control-Allow-Origin` when request Origin header missing', (done) => {
      request(app.callback())
        .get('/')
        .expect(200, { foo: 'bar' })
        .end((err, res) => {
          res.headers.should.not.have.property('access-control-allow-origin');
          done();
        });
    });

    it('should set `Access-Control-Allow-Origin` to request origin header', async () => {
      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Origin', 'https://koajs.com')
        .expect(200, { foo: 'bar' });
    });

    it('should 204 on Preflight Request', async () => {
      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD')
        .expect(204);
    });

    it('should not Preflight Request if request missing Access-Control-Request-Method', async () => {
      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .expect(200, { foo: 'bar' });
    });

    it('should always set `Vary` to Origin', async () => {
      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Vary', 'Origin')
        .expect(200, { foo: 'bar' });
    });
  });

  describe('options.origin=*', () => {
    const app = new Koa();
    app.use(cors({
      origin: '*',
    }));
    app.use(ctx => {
      ctx.body = { foo: 'bar' };
    });

    it('should always set `Access-Control-Allow-Origin` to *', async () => {
      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200, { foo: 'bar' });
    });
  });

  describe('options.origin=function', () => {
    const app = new Koa();
    app.use(cors({
      origin: ctx => {
        if (ctx.url === '/forbin') {
          return false;
        }
        return '*';
      },
    }));
    app.use(ctx => {
      ctx.body = { foo: 'bar' };
    });

    it('should disable cors', done => {
      request(app.callback())
        .get('/forbin')
        .set('Origin', 'https://koajs.com')
        .expect(200, { foo: 'bar' })
        .end((err, res) => {
          res.headers.should.not.have.property('Access-Control-Allow-Origin');
          done();
        });
    });

    it('should set Access-Control-Allow-Origin to *', async () => {
      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200, { foo: 'bar' });
    });
  });

  describe('options.exposeHeaders', () => {
    it('should Access-Control-Expose-Headers: `content-length`', async () => {
      const app = new Koa();
      app.use(cors({
        exposeHeaders: ['content-length', 'x-header'],
      }));
      app.use(ctx => {
        ctx.body = { foo: 'bar' };
      });

      await request(app.callback())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Access-Control-Expose-Headers', 'content-length,x-header')
        .expect(200, { foo: 'bar' });
    });
  });

  describe('options.maxAge', () => {
    const app = new Koa();
    app.use(cors({
      maxAge: 3600,
    }));
    app.use(ctx => {
      ctx.body = { foo: 'bar' };
    });

    it('should set maxAge with Preflight Request', async () => {
      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Max-Age', '3600')
        .expect(204);
    });

    it('should not set maxAge on simple request', (done) => {
      request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .expect(200, { foo: 'bar' })
        .end((err, res) => {
          res.headers.should.not.have.property('Access-Control-Max-Age');
          done();
        });
    });
  });

  describe('options.credentials', () => {
    const app = new Koa();
    app.use(cors({
      credentials: true,
    }));
    app.use(function(ctx) {
      ctx.body = { foo: 'bar' };
    });

    it('should enable Access-Control-Allow-Credentials on Simple Request', async () => {
      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect(200, { foo: 'bar' });
    });

    it('should enable Access-Control-Allow-Credentials on Preflight Request', async () => {
      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect(204);
    });
  });

  describe('options.allowHeaders', () => {
    it('should enable allowHeaders on Preflight Request', async () => {
      const app = new Koa();
      app.use(cors({
        allowHeaders: ['X-PINGOTHER'],
      }));
      app.use(function(ctx) {
        ctx.body = {foo: 'bar'};
      });

      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD')
        .expect('Access-Control-Allow-Headers', 'X-PINGOTHER')
        .expect(204);
    });

    it('should set Access-Control-Allow-Headers to Access-Control-Request-Headers', async () => {
      const app = new Koa();
      app.use(cors());
      app.use(function(ctx) {
        ctx.body = {foo: 'bar'};
      });

      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .set('Access-Control-Request-Headers', 'X-Cache')
        .expect('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD')
        .expect('Access-Control-Allow-Headers', 'X-Cache')
        .expect(204);
    });
  });

  describe('options.allowMethods', () => {
    it('should enable allowMethods on Preflight Request', async () => {
      const app = new Koa();
      app.use(cors({
        allowMethods: ['GET', 'POST'],
      }));
      app.use(function(ctx) {
        ctx.body = {foo: 'bar'};
      });

      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Methods', 'GET,POST')
        .expect(204);
    });

    it('should disbale allowMethods on Simple Request', (done) => {
      const app = new Koa();
      app.use(cors());
      app.use(function(ctx) {
        ctx.body = {foo: 'bar'};
      });

      request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect(200)
        .end((err, res) => {
          res.headers.should.not.have.property('Access-Control-Allow-Methods');
          done();
        });
    });
  });

  describe('options.keepHeadersOnError', () => {
    it('should keep CORS headers if keepHeadersOnError after an error', async () => {
      const app = new Koa();
      app.use(cors({
        keepHeadersOnError: true,
      }));
      app.use(async function(ctx) {
        ctx.body = { foo: 'bar' };
        throw new Error('Whoops!');
      });

      await request(app.callback())
        .get('/')
        .set('Origin', 'https://koajs.com')
        .expect('Access-Control-Allow-Origin', 'https://koajs.com')
        .expect(/Error/)
        .expect(500);
    });

    it('should not affect OPTIONS Request', async () => {
      const app = new Koa();
      app.use(cors({
        keepHeadersOnError: true,
      }));
      app.use(async function(ctx) {
        ctx.body = { foo: 'bar' };
        throw new Error('Whoops!');
      });

      await request(app.callback())
        .options('/')
        .set('Origin', 'https://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,HEAD')
        .expect('Access-Control-Allow-Origin', 'https://koajs.com')
        .expect(204);
    });
  });

  describe('other middleware has been set `Vary` header to Accept-Encoding', () => {
    const app = new Koa();
    app.use(function(ctx, next) {
      ctx.set('Vary', 'Accept-Encoding');
      return next();
    });

    app.use(cors());

    app.use(function(ctx) {
      ctx.body = { foo: 'bar' };
    });

    it('should append `Vary` header to Origin', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', 'Accept-Encoding, Origin')
        .expect(200, { foo: 'bar' });
    });
  });
});
