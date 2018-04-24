'use strict';

const React = require('react');

class Page extends React.PureComponent {
  render() {
    const { children = 'bar', title = 'foo' } = this.props;

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <title>{title}</title>
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
}

module.exports = Page;
