const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    address: String,
    phone: String,
    gender: {
        type: String,
        enum: ['male', 'female']
    }
});


const User = mongoose.model('user', userSchema);

module.exports = User;