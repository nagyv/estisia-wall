# A pluggable message wall

 [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

## Install

```sh
$ npm install --save estisia-wall
```

## Usage

```js
var estisia-wall = require('estisia-wall');
```

See the [API docs](http://nagyv.github.io/estisia-wall/module-WallAPI.html) for available methods.

The basic idea is, that you'll create a wall, then save it's ObjectID somewhere in your models.

Later on you can start any actions provided by the API by supplying the wall id, and the necessary parameters for the action.

## Running tests

To run the tests you'll need a git checkout, as the npm version does not contain them.

```sh
$ npm test
```

or if you are developing this package

```sh
$ grunt watch
```

## Generating the documentation

The following command outputs the documentation under `/docs`

```sh
$ npm run-script gendocs
```

## License

MIT © [Viktor Nagy](https://github.com/nagyv)

<a href="https://github.com/nagyv/estisia-wall"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"></a>
[npm-url]: https://npmjs.org/package/estisia-wall
[npm-image]: https://badge.fury.io/js/estisia-wall.svg
[travis-url]: https://travis-ci.org/nagyv/estisia-wall
[travis-image]: https://travis-ci.org/nagyv/estisia-wall.svg?branch=master
[daviddm-url]: https://david-dm.org/nagyv/estisia-wall.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/nagyv/estisia-wall
