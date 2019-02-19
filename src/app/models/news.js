var mongoose = require('mongoose');
var Schema = mongoose.Schema;
NewsSchema = new Schema({
    heading: String,
    shortDescription: String,
    content: String,
    imageUrl: String,
    addDate: { type: Date, default: Date.now },
    author: String,
    sourceUrl: String,
    source: String    
});
module.exports = mongoose.model('News', NewsSchema);