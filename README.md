# cors

[![NPM version](https://img.shields.io/npm/v/@koex/cors.svg?style=flat)](https://www.npmjs.com/package/@koex/cors)
[![Coverage Status](https://img.shields.io/coveralls/koexjs/cors.svg?style=flat)](https://coveralls.io/r/koexjs/cors)
[![Dependencies](https://img.shields.io/david/koexjs/cors.svg)](https://github.com/koexjs/cors)
[![Build Status](https://travis-ci.com/koexjs/cors.svg?branch=master)](https://travis-ci.com/koexjs/cors)
![license](https://img.shields.io/github/license/koexjs/cors.svg)
[![issues](https://img.shields.io/github/issues/koexjs/cors.svg)](https://github.com/koexjs/cors/issues)

> cors for koa extend.

### Install

```
$ npm install @koex/cors
```

### Usage

```javascript
// See more in test
import cors from '@koex/cors';

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