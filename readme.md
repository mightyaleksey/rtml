# rtml

A CLI tool to render React components into html.

The main idea is to provide a convenient wrapper for `ReactDOMServer.renderToStaticMarkup()` and to have a possibility to generate html pages from the plain components.


## Usage

```
  $ rtml <file,glob> [options]

  Options:

    -d, --dir      change output dir
    -h, --help     print usage
    -s, --styled   inject generated css via styled-components into html
    -v, --version  print version
    -w, --watch    use watch mode

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


## License

> MIT License

&copy; 2018 Alexey Litvinov
