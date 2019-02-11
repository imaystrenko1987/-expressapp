const News = require('./models/news');

module.exports = function(app, passport, logger) {
	const getFullUrl = (req) => {
		return `${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`;
	};
	
	app.get('/', function(req, res) {
		res.redirect('/news');
	});

	app.get('/auth/facebook', passport.authenticate('facebook'));
 
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}));

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
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
	 
	 app.post('/news', isLoggedIn, function (req, res) {
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
	 
	 app.put('/news/:id', isLoggedIn, function (req, res) {
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
		isLoggedIn(req, res, function(){
			News.remove({
				_id : id
			}, function(err) {
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
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}
