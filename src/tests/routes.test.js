//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let News = require('../app/models/news');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
let expect = chai.expect;


chai.use(chaiHttp);
chai.use(function (chai, utils) {
    var Assertion = chai.Assertion;
  
    Assertion.addMethod('articleHas', function (expected, idKey) {
      var obj = this._obj;
      new Assertion(obj[idKey]).to.be.a('string');
      new Assertion(obj).to.have.property(idKey, expected[idKey]);
    });
  });

describe('News', () => {
    beforeEach((done) => {
        News.deleteMany({}, (err) => {
            done();
        });
    });

    describe('/GET news', () => {
        it('it should GET all the news', (done) => {
            chai.request(server)
                .get('/news')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST news', () => {
        it('it should not POST an article without heading field', (done) => {
            let article = {
                content: "Test content",
                imageUrl: "",
                author: "test author"
            }
            chai.request(server)
                .post('/news')
                .send(article)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('heading');
                    res.body.errors.heading.should.have.property('kind').eql('required');
                    done();
                });
        });

    });

    describe('/POST news', () => {
        it('it should POST an article with all fields', (done) => {
            let article = {
                heading: "Test heading",
                content: "Test content",
                imageUrl: "",
                author: "test author"
            }
            chai.request(server)
                .post('/news')
                .send(article)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.should.not.property('errors');
                    res.body.length.should.not.eql(0);
                    done();
                });
        });

    });

    describe('/GET/:id news', () => {
        it('it should GET an article by id', (done) => {
            let article = new News({
                heading: "Test heading",
                content: "Test content",
                imageUrl: "",
                author: "test author"
            });
            article.save((err, article) => {
                chai.request(server)
                    .get('/news/' + article.id)
                    .send(article)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        expect(article).to.be.articleHas(res.body, 'heading');
                        expect(article).to.be.articleHas(res.body, 'content');
                        expect(article).to.be.articleHas(res.body, 'imageUrl');
                        expect(article).to.be.articleHas(res.body, 'author');
                        res.body.should.have.property('_id').eql(article.id);
                        done();
                    });
            });

        });
    });

    describe('/PUT/:id news', () => {
        it('it should UPDATE an article with id', (done) => {
            let article = new News({
                heading: "Test heading",
                content: "Test content",
                imageUrl: "",
                author: "test author"
            });
            article.save((err, article) => {
                chai.request(server)
                    .put('/news/' + article.id)
                    .send({
                        heading: "Test heading 1",
                        content: "Test content 1",
                        imageUrl: "",
                        author: "test author 1"
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.eql('Successfully! Article updated - ' + article.id);
                        done();
                    });
            });
        });
    });

    describe('/DELETE/:id article', () => {
        it('it should delete an article by id', (done) => {
            let article = new News({
                heading: "Test heading",
                content: "Test content",
                imageUrl: "",
                author: "test author"
            });
            article.save((err, article) => {
                chai.request(server)
                    .delete('/news/' + article.id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.eql('Successfully! Article has been Deleted. Id=' + article.id);
                        done();
                    });
            });
        });
    });

    describe('404 page for other routes', () => {
        it('it should return 404 for unknown pages', (done) => {
            chai.request(server)
                .get('/testPage/id')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql('Nothing found');
                    done();
                });
        });
    });
});