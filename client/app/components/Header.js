'use strict';

import React from 'react';

class Header extends React.Component {
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
      <header id="page-header">
        Header
      </header>
    );
  }
}

export default Header;
