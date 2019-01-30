'use strict';

const express = require('express');
const moment = require('moment');
const app = express();
const bodyParser = require('body-parser'); //Required to parse data coming from POST requests
const cors = require('cors');

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const mongo = require('mongodb');

const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: 'true' })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse requests of content-type - application/json

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.static('public')); //serves the css file for index.html

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, { 
  useNewUrlParser: true 
}).then( () => {
  console.log("Successfully connected to database");
}).catch(err => {
  console.log("Failed to connect to database. Exiting now. Error: ", err);
  process.exit();
});

require("./app/routes/athlete.routes.js")(app);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
