'use strict';

const express = require('express');
const debug = require('debug')('brewery:server');

const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT, () => {
  debug(`listening on ${PORT}`);
});
