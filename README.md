#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> The best module ever.


## Install

```sh
$ npm install http-loader --save
```

##Description
This is a standard REST API loader for use with the chrysalis framework: [https://github.com/APPrise-Mobile/chrysalis]


## Usage
Initialize the loader with a url.  The loader with hit this url with a POST request and the data supplied to the loader through the chyrsalis framework.

```js
var httpLoader = require('http-loader');
var chysalis = require('chrysalis');

var createUrl = 'http://rest-api-create-url.com'
var loader = httpLoader(createUrl);

var chrysis = chrysalis();
chrysis.setLoader(loader);
```


## License

MIT © [APPrise-Mobile]()


[npm-image]: https://badge.fury.io/js/http-loader.svg
[npm-url]: https://npmjs.org/package/http-loader
[travis-image]: https://travis-ci.org/APPrise-Mobile/http-loader.svg?branch=master
[travis-url]: https://travis-ci.org/APPrise-Mobile/http-loader
[daviddm-image]: https://david-dm.org/APPrise-Mobile/http-loader.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/APPrise-Mobile/http-loader
