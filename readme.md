# rtml

A CLI tool to render React components into html.

The main idea is to provide a convenient wrapper for `ReactDOMServer.renderToStaticMarkup()` and to have a possibility to generate html pages from the plain components.


## Usage

```
  $ rtml <file,glob> [options]

  Options:

    -d, --dir <path>  change output dir
    -h, --help        print usage
    -s, --styled      inject generated css via styled-components into html
    -v, --version     print version
    -w, --watch       use watch mode

  Examples:

    Transform React Component into index.html
    $ rtml src/pages/index.js

    Watch for changes and update resulting html files
    $ rtml src/pages/*.js -d dist -w
```


## Installation

via yarn:

```bash
yarn add rtml --dev
```

or via npm:

```
npm install -D rtml
```

**Note** that rtml assumes that you have already installed `react@16` and `react-dom@16` packages. In case you want to inject `ServerStyleSheet` from `styled-components` into the final html, you also need to install it manually and use the `--styled` flag.


## Recipes

### React

#### Install dependencies.

```bash
npm install --save react
npm install --save react-dom
npm install --save-dev npm-run-all
npm install --save-dev parcel-bundler
npm install --save-dev rtml
npm install --save-dev babel-preset-env
npm install --save-dev babel-preset-react
npm install --save-dev babel-plugin-transform-class-properties
```

or via yarn:

```bash
yarn add react
yarn add react-dom
yarn add --dev npm-run-all
yarn add --dev parcel-bundler
yarn add --dev rtml
yarn add --dev babel-preset-env
yarn add --dev babel-preset-react
yarn add --dev babel-plugin-transform-class-properties
```


#### Setup .babelrc

```js
// .babelrc
{
  "presets": ["env", "preact"],
  "plugins": ["transform-class-properties"]
}
```


#### Add scripts to package.json

```js
// package.json
{
  "scripts": {
    "html": "rtml src/pages/*.js -d src/.html",
    "html:watch": "rtml src/pages/*.js -d src/.html -w",
    "serve": "parcel serve src/.html/*.html -d dist",
    "start": "yarn html && npm-run-all --parallel html:watch serve"
  }
}
```


### Styled Components

Run same steps for React.

#### Add additional deps

```bash
npm install styled-components
```

or via yarn:

```bash
yarn add styled-components
```


#### Update scripts in package.json

```js
// package.json (add the -s flag)
{
  "scripts": {
    "html": "rtml src/pages/*.js -sd src/.html",
    "html:watch": "rtml src/pages/*.js -sd src/.html -w",
  }
}
```


## License

> MIT License

&copy; 2018 Alexey Litvinov
