const mongoose = require('mongoose');
const googleAuthUsersSchema = new mongoose.Schema({
    googleId:String,
    displayName:String,
    email: String,

});

const User = mongoose.model('googleAuthUsers',googleAuthUsersSchema);
module.exports = User;
