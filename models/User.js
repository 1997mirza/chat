const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user: {
    type: String
  }
},{ versionKey: false });

module.exports = User = mongoose.model('user', UserSchema);