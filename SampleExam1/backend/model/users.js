// get an instance of mongoose and mongoose.Schema
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config';  

var Schema = mongoose.Schema;

var userSchema = new Schema({ 
    username: {type: String, required: true, unique: true}, 
    first: {type: String, required: true},
    last: {type: String, required: true},
    salt: {type: String, required: true}, 
    hash: {type: String, required: true}
});


userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    console.log(this.hash === hash);
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        first: this.first,
        last: this.last,
        exp: parseInt(expiry.getTime() / 1000),
    }, config.secret);
};

export default mongoose.model('User', userSchema);