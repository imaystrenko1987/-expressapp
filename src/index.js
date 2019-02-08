const express = require('express');
const app = express();
const port = process.env.PORT || 3336;
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const configDB = require('./config/database.js');
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf } = format;
require('./config/passport')(passport);

mongoose.connect(configDB.url, configDB.options);

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './src/app.log' })
  ]
});

app.use(bodyParser.urlencoded({'extended':'true'}));         
app.use(bodyParser.json());                                     
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'topsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./app/routes.js')(app, passport, logger);

let server = app.listen(port, function () {
    console.log("Listening at http://%s:%s", server.address().address, port)
 });