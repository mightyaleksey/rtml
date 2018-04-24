'use strict';

const React = require('react');
const styled = require('styled-components').default;
const e = React.createElement;

const html = styled.html`
  height: 100%;
`;

const body = styled.body`
  height: 100%;
`;

class Page extends React.PureComponent {
  render() {
    const { children = 'bar', title = 'foo' } = this.props;

    return (
      e(html, null,
        e('head', null,
          e('meta', { charSet: 'utf-8' }),
          e('title', null, title)
        ),
        e(body, null,
          children
        )
      )
    )
  }
}

module.exports = Page;
