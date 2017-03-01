'use strict';

import React from 'react';

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  onChange(state) {
    this.setState(state);
  }

  render() {
    return (
      <footer id="page-footer">
        Footer
      </footer>
    );
  }
}

export default Footer;
