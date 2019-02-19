const News = require('./models/news');

module.exports = function (app, passport, logger) {
	const getFullUrl = (req) => {
		return `${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`;
	};

	app.get('/', function (req, res) {
		res.redirect('/news');
	});

	app.get('/auth/facebook', passport.authenticate('facebook'));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
		function (req, res) {
			res.redirect('/');
		});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/news', function (req, res) {
		logger.info(getFullUrl(req));
		var search = {};
		if (req.query.source) {
			search.source = req.query.source;
		}
		if (req.query.sourceUrl) {
			search.author = req.query.sourceUrl;
		}
		var searchText = req.query.heading;
		if (searchText) {
			search.$or = [ 
				{ heading: {$regex : searchText} }, 
				{ shortDescription: {$regex : searchText} }, 
				{ content: {$regex : searchText} } ];
		}
		if (req.query.author) {
			search.author = req.query.author;
		}

		News.find(search, function (err, articles) {
			if (err) {
				res.send(err);
			}
			res.json(articles);
		});
	});

	app.get('/news/:id', function (req, res) {
		logger.info(getFullUrl(req));
		let id = req.params.id;
		News.findById(id, function (err, news) {
			if (err) {
				res.send(err);
			}
			res.json(news);
		});
	});

	app.post('/news', function (req, res) {
		logger.info(getFullUrl(req));
		logger.info(req.body.author);
		News.create({
			heading: req.body.heading,
			shortDescription: req.body.shortDescription,
			content: req.body.content,
			imageUrl: req.body.imageUrl,
			addDate: req.body.addDate,
			author: req.body.author,
			sourceUrl: req.body.sourceUrl,
			source: req.body.source
		}, function (err, articles) {
			if (err) {
				res.send(err);
			}

			News.find(function (err, articles) {
				if (err) {
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
			heading: req.body.heading,
			shortDescription: req.body.shortDescription,
			content: req.body.content,
			imageUrl: req.body.imageUrl,
			addDate: req.body.addDate,
			author: req.body.author,
			sourceUrl: req.body.sourceUrl,
			source: req.body.source
		}

		// save the user
		News.findByIdAndUpdate(id, data, function (err, news) {
			if (err)
				throw err;

			res.send('Successfully! Article updated - ' + news._id);
		});
	});

	app.delete('/news/:id', function (req, res) {
		logger.info(getFullUrl(req));
		let id = req.params.id;
		isLoggedIn(req, res, function () {
			News.remove({
				_id: id
			}, function (err) {
				if (err)
					res.send(err);
				else
					res.send('Successfully! Article has been Deleted.');
			});
		});
	});

	app.get('*', function (req, res) {
		logger.info(getFullUrl(req));
		throw new Error('Page not found');
	});
};

function isLoggedIn(req, res, next) {
	if (true)//req.isAuthenticated())
		return next();

	res.redirect('/login');
}
