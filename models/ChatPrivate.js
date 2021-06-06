const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatPrivateSchema = new Schema({
  posiljaoc: {
    type: String
  },
  primalac: {
    type: String
  },
  vrijeme: {
    type: String
  },
  poruka: {
    type: String,
  }
},{ versionKey: false });

module.exports = ChatPrivate = mongoose.model('chatPrivate', ChatPrivateSchema);