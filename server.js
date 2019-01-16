let express = require('express');
let bodyParser = require('body-parser');
let winston = require('winston');
let app = express();
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let router = express.Router();
app.set('view engine', 'ejs');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

app.use('/',router);

app.get('/', function (req, res) {
	logger.info(req.url);
   throw new Error('test error');
   res.send('get default page');
});

app.get('/news', function (req, res) {
   logger.info(req.url);
   res.send('get all news');
});

app.get('/news/:id', function (req, res) {
   logger.info(req.url);
   res.send('get news by id');
});

app.post('/news', function (req, res) {
   logger.info(req.url);
   res.send('post completed');
});

app.put('/news/:id', urlencodedParser, function (req, res) {
   logger.info(req.url);
   res.send('put completed');
});

app.delete('/news/:id', function (req, res) {
   logger.info('Hello again distributed logs');
   res.send('delete completed');
});

app.use(function(err,req,res,next) {
  console.log(err.stack);
  res.status(500);
  res.render('pages/index', { error: err.message });
});

let server = app.listen(3335, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Listening at http://%s:%s", host, port)
});