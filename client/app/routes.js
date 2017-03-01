'use strict';


/*eslint-disable no-unused-vars*/
import React from 'react';
import {Route} from 'react-router';
/*eslint-enable no-unused-vars*/

import App from './components/App';
import Home from './components/Home';

export default (
  <Route component={App}>
    <Route path='/' component={Home} />
  </Route>
);
