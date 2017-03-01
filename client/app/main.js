'use strict';

/*eslint-disable no-unused-vars*/
import React from 'react';
import Router from 'react-router';
/*eslint-enable no-unused-vars*/

import ReactDOM from 'react-dom';
import routes from './routes';

ReactDOM.render(<Router>{routes}</Router>, document.getElementById('app'));
