'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const debug = require('debug')('eula:server.js');
const errors = require('./lib/error-middleware.js');
const authRouter = require('./route/auth-router.js');
const cabinetRouter = require('./route/cabinet-router.js');
const eulaRouter = require('./route/eula_router.js');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.load();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(cabinetRouter);
app.use(authRouter);
app.use(eulaRouter);
app.use(errors);

app.listen(PORT, function () {
  debug(`listening on port ${PORT}`);
})