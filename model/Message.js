const mongoose = require('mongoose')

const schema = mongoose.Schema({
  sender: Object,
  target: Object,
  content: String,
  timestamp: { type: Date, default: Date.now }
}, {collection: process.env.COLLECTION_NAME})

module.exports = mongoose.model('Message', schema)
