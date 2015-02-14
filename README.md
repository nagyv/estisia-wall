#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

> A pluggable message wall


## Install

```sh
$ npm install --save estisia-wall
```

## Usage

```js
var estisia-wall = require('estisia-wall');
```

See the [API docs](http://nagyv.github.io/estisia-wall/) for available methods.

The basic idea is, that you'll create a wall, then save it's ObjectID somewhere in your models.

Later on you can start any actions provided by the API by supplying the wall id, and the necessary parameters for the action.

## License

MIT © [Viktor Nagy](https://github.com/nagyv/estisia-wall)

[npm-url]: https://npmjs.org/package/estisia-wall
[npm-image]: https://badge.fury.io/js/estisia-wall.svg
[travis-url]: https://travis-ci.org/nagyv/estisia-wall
[travis-image]: https://travis-ci.org/nagyv/estisia-wall.svg?branch=master
[daviddm-url]: https://david-dm.org/nagyv/estisia-wall.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/nagyv/estisia-wall
