'use strict';

const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('app: server');
const cors = require('cors');
const morgan = require('morgan');
const error = require('./lib/error.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('debug'));
app.use(cors());
app.use(error);

app.listen(PORT, () => {
  debug('Server Actice: ', PORT);
});