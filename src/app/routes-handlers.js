const { loggers } = require('winston');
const logger = loggers.get('logger');
const News = require('./models/news');

const getFullUrl = (req) => {
    return `${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`;
};

module.exports = {
    getRoot: function (req, res) {
		res.redirect('/news');
    },
    getNewsById: function (req, res) {
		logger.info(getFullUrl(req));
		let id = req.params.id;
		News.findById(id, function (err, news) {
			if (err) {
				res.send(err);
			}
			res.json(news);
		});
	},
    getNews: function (req, res) {
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
	},
    postNews: function (req, res) {
		logger.info(getFullUrl(req));
        logger.info(req.body.author);
        if(!req.body.heading){
            res.send({errors: {heading: {kind: "required"}} });
            return;
        }
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
	},
    putNews: function (req, res) {
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

			res.send({message: 'Successfully! Article updated - ' + news._id});
		});
	},
    deleteNews: function (req, res) {
		logger.info(getFullUrl(req));
		let id = req.params.id;
		News.remove({
            _id: id
        }, function (err) {
            if (err)
                res.send(err);
            else
                res.send({message: 'Successfully! Article has been Deleted. Id=' + id});
        });
    },
    otherPages: function (req, res) {
		logger.info(getFullUrl(req));
		res.status(404);
        res.send({message: "Nothing found"});
	}
};