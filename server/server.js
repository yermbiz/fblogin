'use strict';
/*eslint no-console: ["error", { allow: ["log", "error"] }] */
// Babel ES6/JSX Compiler
require('babel-register');

const fbgraph = require('fbgraph');
const swig  = require('swig');
const React = require('react');
const ReactDOM = require('react-dom/server');
const Router = require('react-router');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const config = require('./config');
const routes = require('../client/app/routes');

require('./models/User');
const postAuth = require('./handlers/postAuth')(fbgraph);

mongoose.connect(config.database);
mongoose.connection.on('error', () => {
  console.error('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

process.on('SIGINT', () => {
  mongoose.connection.close( () => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose default connection error: ' + err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open to ' + config.database);
});

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/auth', postAuth);

/**
 *  React middleware
 */
app.use((req, res) => {
  Router.match({ routes: routes.default, location: req.url }, (err, redirectLocation, renderProps) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
      const page = swig.renderFile('./client/views/index.html', { html: html } );
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found');
    }
  });
});

const server = require('http').createServer(app);

server.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
