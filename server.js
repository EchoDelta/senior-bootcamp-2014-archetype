var express = require('express');
var request = require('request');
var async = require('async');
var cache = require('memory-cache');
var app = express();
var mongo = require('mongodb').MongoClient;
var quiche = require('quiche');

app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
app.use(express.bodyParser());

var Socialcast = require('./socialcast');
var Ansattliste = require('./ansattliste');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;
var mongolaburl = process.env.MONGOLAB_URI; 

var ansatte = {};
var messageCollection;

app.get('/', function(req, res){
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
      //res.json(messages);
      res.render('index', { 
        messages: messages,
        title: "Flodes hjemmeside - 1994" 
      });
    });
  });
});

app.get('/messages', function(req, res){
  var newMessages = [];
  Socialcast.getMessages(function(messages) {
    async.each(messages, function(message, done) {
      var name = message.user.name;

      if(ansatte[name]){
        message.user.senioritet = ansatte[name].Seniority;
        message.user.avdeling = ansatte[name].Department;  
      }
      else{
        var ansatt = Ansattliste.fuzzySearch(name, ansatte);
        if(ansatt){
          message.user.senioritet = ansatt.Seniority;
          message.user.avdeling = ansatt.Department;  
        }
      }

      done();
    }, function(error) {
      if(error){
        console.log("Oops");
      }
      res.json(messages);
    });
  });
});


app.get('/message/:id', function(req, res){
  messageCollection.findOne({ "id": parseInt(req.params.id, 10) }, function(err, item) {
    if(item) {
      res.json(item);
    } else {
      Socialcast.getMessage(req.params.id, function(message){
        if(message){
          var name = message.user.name;
          if(ansatte[name]){
            message.user.senioritet = ansatte[name].Seniority;
            message.user.avdeling = ansatte[name].Department;  
          }
          else{
            var ansatt = Ansattliste.fuzzySearch(name, ansatte);
            if(ansatt){
              message.user.senioritet = ansatt.Seniority;
              message.user.avdeling = ansatt.Department;  
            }
          }
        }
        res.json(message);
      });
    }
  });
});

app.post('/push', function(req, res){
  var message = req.body;
  messageCollection.update({ id: message.id }, message, { upsert: true}, function(err, result) {
    if(err){
      console.log("Error inserting message: "+message.id);
    } else {
      messageCollection.findOne({ id: message.id }, function(err, item) {
        console.log(item);
      })
    }

    res.send("Success", 200);
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

app.get('/stats', function(req, res) {
  var pie = new quiche('pie');
  var stats = Socialcast.getPercentage();
  var colors = ["F229BD", "7A29F2", "139C5C", "EBD913"];

  for(var i = 0; i < stats.length; i++ ){
    pie.addData(stats[i].prosentandel, stats[i].senioritet, colors[i]);
  }
  pie.setTransparentBackground();
  pie.setWidth(600);
  pie.setHeight(400);
  
  res.render('stats', {
    stats: stats,
    pie: pie.getUrl(true),
    title: "Sykt freshe stats"
  });
});

mongo.connect(mongolaburl, function(error, db) {
    if (error) throw error;
    messageCollection = db.collection('messages');
});

Ansattliste.getAll(function(result){
  var employees = {};
  async.each(result, function(employee, done){
    var name = employee.Name;
    Ansattliste.getByName(name, function (ansatt) {
      if(ansatt){
        employees[name] = ansatt;
      }
      done();
    });
  },
  function(){
    ansatte = employees;
   
    // if on heroku use heroku port.
    var port = process.env.PORT || 1339;
    app.listen(port);
    console.log("App started");
  });
});
