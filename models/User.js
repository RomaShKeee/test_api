var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  userId: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  userIdType: {type: String, enum: ['phone', 'email'], default : 'phone'},
  hash: String,
  salt: String,
  tokens: [String]
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var token = jwt.sign({
    id: this._id,
    user: {
      id: this.userId,
      type: this.userIdType,
    }
  }, secret, { expiresIn: '10m' });
  this.persistToken(token);
  return token;
};

UserSchema.methods.toAuthJSON = function(){
  return {
    id: this.userId,
    type: this.userIdType,
    token: this.generateJWT()
  };
};

UserSchema.methods.persistToken = function(token){
  this.tokens.push(token);

  return this.save();
};

UserSchema.methods.destroyToken = function(token){
  this.tokens.pull(token);
  
  return this.save();
};

UserSchema.methods.destroyAllTokens = function(){
  this.tokens = [];
  return this.save();
};

mongoose.model('User', UserSchema);
