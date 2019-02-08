var mongoose = require('mongoose');
var Schema = mongoose.Schema;
NewsSchema = new Schema({
    author: String,
    title: String,
    description: String,
    content: String,
    publishedAt: { type: Date, default: Date.now }
    
});
module.exports = mongoose.model('News', NewsSchema);