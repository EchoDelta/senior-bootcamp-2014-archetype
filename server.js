
var express = require('express');
var request = require('request');
var async = require('async');
var app = express();

app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'))

var Socialcast = require('./socialcast');
var Ansattliste = require('./ansattliste');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;

app.get('/', function(req, res){
  res.render('index', { title: 'Express' })
});

app.get('/messages', function(req, res){
  var newMessages = [];
  Socialcast.getMessages(function(messages){
    async.each(messages, function(message, done){
      var name = message.user.name;
      Ansattliste.getByName(name, function (ansatt) {
        if(ansatt){
          message.user.senioritet = ansatt.Seniority;
          message.user.avdeling = ansatt.Department;
        }
        done();
      });
    }, function(error) {
      if(error){
        console.log("Oops");
      }
      res.json(messages);
    })
  });
});


app.get('/message/:id', function(req, res){
  Socialcast.getMessage(req.params.id, function(data){
    res.json(data);
  });
});

app.get('/ansatt/:name', function(req, res){
  Ansattliste.getByName(req.params.name, function(data){
    res.json(data);
  });
});

app.get('/ansatt/alternative/:name', function(req, res){
  Ansattliste.fuzzySearch(req.params.name, function(data){
    res.json(data);
  });
});

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
app.listen(port);