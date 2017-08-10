'use strict';

const express = require('express');
const debug = require('debug')('poke:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const authRouter = require('./route/auth-route.js');
const pokemonRouter = require('./route/pokemon-route.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(pokemonRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`Listening on: ${PORT}`);
});