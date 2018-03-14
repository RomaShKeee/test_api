var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
  useridField: 'user[id]',
  passwordField: 'user[password]'
}, function(id, password, done) {
  User.findOne({useId: id}).then(function(user){
    if(!user || !user.validPassword(password)){
      return done(null, false, {errors: {'id or password': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}));
