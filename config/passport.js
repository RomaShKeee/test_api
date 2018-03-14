var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'user[id]',
  passwordField: 'user[password]'
}, function(id, password, done) {
  User.findOne({userId: id}).then(function(user){
    if(!user || !user.validPassword(password)){
      return done(null, false, {errors: {'id or password': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}));
