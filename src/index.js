const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const winston = require('winston');
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const router = express.Router();
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('json spaces', 40);

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const getFullUrl = (req) => {
	return `${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`;
};

const getAllNews = (res, processData) => {
	fs.readFile('./src/db/news.json', 'utf8', function (err, data) {
	if (err) {
		res.status(500);
		res.render('pages/index', { error: err.message });
	}
	data = JSON.parse(data);
	if(typeof(processData) === 'function')
	{
	  data = processData(data);
    }
	res.json(data);
   });
};

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



app.get('/', function (req, res) {
	logger.info(getFullUrl(req));
	res.redirect('/news');
});

app.get('/news', function (req, res) {
   logger.info(getFullUrl(req));
   return getAllNews(res);
});

app.get('/news/:id', function (req, res) {
   logger.info(getFullUrl(req));
   const filterNews = (data) => {
	   data.news = data.news.filter(item => item.id == req.params.id);
	   return data;
   };
   return getAllNews(res, filterNews);
});

app.post('/news', function (req, res) {
   logger.info(getFullUrl(req));
   res.send('post completed');
});

app.put('/news/:id', urlencodedParser, function (req, res) {
   logger.info(getFullUrl(req));
   res.send('put completed');
});

app.delete('/news/:id', function (req, res) {
   logger.info(getFullUrl(req));
   res.send('delete completed');
});

app.get('*', function (req, res) {
   logger.info(getFullUrl(req));
   throw new Error('Page not found');
});

app.use('/',router);
app.use(function(err,req,res,next) {
  console.log(err.stack);
  res.status(500);
  res.render('pages/index', { error: err.message });
});

let server = app.listen(3336, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Listening at http://%s:%s", host, port)
});