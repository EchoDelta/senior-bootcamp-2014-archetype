var express = require('express');
var request = require('request');
var async = require('async');
var app = express();

app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));

var Socialcast = require('./socialcast');
var Ansattliste = require('./ansattliste');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;

var ansatte = {};

app.get('/', function(req, res){
  res.render('index', { title: 'Express' })
});

app.get('/messages', function(req, res){
  var newMessages = [];
  Socialcast.getMessages(function(messages) {
    async.each(messages, function(message, done) {
      var name = message.user.name;
      Ansattliste.getByName(name, function (ansatt) {
        if(ansatt){
          message.user.senioritet = ansatt.Seniority;
          message.user.avdeling = ansatt.Department;
          done();
        } else {
          var ansattid = Ansattliste.fuzzySearch(name, ansatte);
          if(ansattid != -1) {
            Ansattliste.getById(ansattid, function(ansatt) {
              if(ansatt.length>0){
                message.user.senioritet = ansatt[0].Seniority;
                message.user.avdeling = ansatt[0].Department;
              }
              done();
            });              
          }
          else {
            done();
          }
        }
      });
    }, function(error) {
      if(error){
        console.log("Oops");
      }
      res.json(messages);
    });
  });
});


app.get('/message/:id', function(req, res){
  Socialcast.getMessage(req.params.id, function(message){
    if(message){
      var name = message.user.name;
      Ansattliste.getByName(name, function (ansatt) {
        if(ansatt){
          message.user.senioritet = ansatt.Seniority;
          message.user.avdeling = ansatt.Department;
          res.json(message);
        } else {
          var ansattid = Ansattliste.fuzzySearch(name, ansatte);
          if(ansattid != -1){
            Ansattliste.getById(id, function(ansatt) {
              if(ansatt.length>0){
                message.user.senioritet = ansatt[0].Seniority;
                message.user.avdeling = ansatt[0].Department;
              }
              res.json(message);
            });
          }
          else {
            res.json(message);
          }
        }
      });
    }
  });
});

app.get('/ansatt/:name', function(req, res){
  Ansattliste.getByName(req.params.name, function(data){
    res.json(data);
  });
});

app.get('/ansatt/id/:id', function(req, res){
  Ansattliste.getById(req.params.id, function(data){
    res.json(data);
  });
});

app.get('/ansatt/alternative/:name', function(req, res){
  Ansattliste.fuzzySearch(req.params.name, function(data){
    res.json(data);
  });
});

Ansattliste.getAll(function(result){
  ansatte = result;

  // if on heroku use heroku port.
  var port = process.env.PORT || 1339;
  app.listen(port);
  console.log("App started");

});
