
var express = require('express');
var request = require('request');
var app = express();

var Socialcast = require('./socialcast');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;

app.get('/messages', function(req, res){
  Socialcast.getMessages(function(data){
    res.json(data);
  });
});


app.get('/message/:id', function(req, res){
  Socialcast.getMessage(req.params.id, function(data){
    res.json(data);
  });
});

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
app.listen(port);