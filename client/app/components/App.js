'use strict';

import React from 'react';
/*eslint-disable no-unused-vars*/
import Header from './Header';
import Footer from './Footer';
/*eslint-enable no-unused-vars*/


class App extends React.Component {
  render() {
    return (
      <div id="wrapper">
          <Header />
              {this.props.children}
          <Footer />
      </div>
    );
  }
}

export default App;
