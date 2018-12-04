# koa-cors

[![NPM version](https://img.shields.io/npm/v/@zcorky/koa-cors.svg?style=flat)](https://www.npmjs.com/package/@zcorky/koa-cors)
[![Coverage Status](https://img.shields.io/coveralls/zcorky/koa-cors.svg?style=flat)](https://coveralls.io/r/zcorky/koa-cors)
[![Dependencies](https://david-dm.org/@zcorky/koa-cors/status.svg)](https://david-dm.org/@zcorky/koa-cors)
[![Build Status](https://travis-ci.com/zcorky/koa-cors.svg?branch=master)](https://travis-ci.com/zcorky/koa-cors)
![license](https://img.shields.io/github/license/zcorky/koa-cors.svg)
[![issues](https://img.shields.io/github/issues/zcorky/koa-cors.svg)](https://github.com/zcorky/koa-cors/issues)

> helmet for Koa, wrapper with helmet.

### Install

```
$ npm install @zcorky/koa-cors
```

### Usage

```javascript
// See more in test
import cors from '@zcorky/koa-cors';

import * as Koa from 'koa';
const app = new Koa();

app.use(cors());

app.use(ctx => {
  ctx.body = 'Hello, World!';
});

app.listen(8000, '0.0.0.0', () => {
  console.log('koa server start at port: 8000');
});
```

### Related
* [koa-cors](https://github.com/koajs/cors)