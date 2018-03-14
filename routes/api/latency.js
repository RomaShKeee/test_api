var express = require('express');
var router = express.Router();
var ping = require('ping');
var auth = require('../auth');

router.get('/latency', auth.required, function(req, res, next){
  ping.promise.probe('google.com', {
    timeout: 5,
    min_reply: 1
  }).then(function (result) {
    return res.json({time: result.time});
  }).catch(next);
});

module.exports = router;
