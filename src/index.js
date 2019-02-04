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
var mongoose = require('mongoose');
var database = require('./db/db');

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(methodOverride());

//app.use(urlencodedParser);
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

//mongoose.connect('mongodb://localhost/news-db', { useNewUrlParser: true });
var News = require('./db/models/news');
mongoose.connect(database.url, database.options);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('json spaces', 40);

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const getFullUrl = (req) => {
	return `${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`;
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
   News.find(function(err, articles) {
		if (err){
         res.send(err);
      }
		res.json(articles);
	});
});

app.get('/news/:id', function (req, res) {
   logger.info(getFullUrl(req));
   let id = req.params.id;
	News.findById(id, function(err, news) {
		if (err){
         res.send(err);
      } 
		res.json(news);
	});
});

app.post('/news', function (req, res) {
   logger.info(getFullUrl(req));
   logger.info(req.body.author);
   News.create({
      author: req.body.author,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content
	}, function(err, articles) {
		if (err){
         res.send(err);
      }

		News.find(function(err, articles) {
			if (err){
            res.send(err);
         }
			res.json(articles);
		});
	});
});

app.put('/news/:id', function (req, res) {
   logger.info(getFullUrl(req));
   let id = req.params.id;
	var data = {
      author: req.body.author,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content
	}
 
	// save the user
	News.findByIdAndUpdate(id, data, function(err, news) {
   if (err) 
      throw err;
 
	res.send('Successfully! Article updated - ' + news.title);
	});
});

app.delete('/news/:id', function (req, res) {
   logger.info(getFullUrl(req));
   let id = req.params.id;
	News.remove({
		_id : id
	}, function(err) {
		if (err)
			res.send(err);
		else
			res.send('Successfully! Article has been Deleted.');	
	});
});

app.get('*', function (req, res) {
   logger.info(getFullUrl(req));
   throw new Error('Page not found');
});
