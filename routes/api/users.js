var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');
var config = require('../../config'),
  phoneRegex = config.phoneRegex,
  emailRegex = config.emailRegex;

router.post('/signin', function(req, res, next){
  if(!req.body.user.id){
    return res.status(422).json({errors: {id: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});


router.post('/signup', function(req, res, next){
  var user = new User();
  var userId = req.body.user.id;

  if(typeof userId !== 'undefined' && phoneRegex.test(userId)){
    user.userId = userId;
    user.userIdType = 'phone';
  }

  if(typeof userId !== 'undefined' && emailRegex.test(userId)){
    user.userId = userId;
    user.userIdType = 'email';
  }

  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.get('/info', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.post('/logout', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    if(typeof req.body.all == 'undefined'){
      return res.status(422).json({errors: {all: "can't be blank"}});
    }
    
    if(req.body.all == 'true'){ 
      return user.destroyAllTokens().then(function(){
        return res.json({message: "success"});
      });
    ;}

    if(req.body.all == 'false'){
      return user.destroyToken(req.payload.token).then(function(){
        return res.json({message: "success"});
      });
    }
    
    return res.json({message: "failed"});
  }).catch(next);
});

module.exports = router;
