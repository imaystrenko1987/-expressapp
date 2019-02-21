const News = require('./models/news');
const { getRoot, getNews, getNewsById, postNews, putNews, deleteNews, otherPages } = require('../app/routes-handlers');
module.exports = function (app, passport, logger) {

	app.get('/', getRoot);

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

	app.get('/news', getNews);

	app.get('/news/:id', getNewsById);

	app.post('/news', postNews);

	app.put('/news/:id', putNews);

	app.delete('/news/:id', deleteNews);

	app.get('*', otherPages);
};

function isLoggedIn(req, res, next) {
	if (true)//req.isAuthenticated())
		return next();

	res.redirect('/login');
}
