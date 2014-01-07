var request = require('request');
var async = require('async');
var cache = require('memory-cache');
var url = process.env.URL;
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

var requestOptions = function(path){
	return {
      auth: {
        'user': username,
        'pass': password
      },
      url: url + path,
      json: true,
      headers: {
        'User-Agent': 'request',
        'accept': 'application/json'
      }
    }
};

var getLikes = function(id, callback){
	var l = cache.get("likes"+id);
	if(!l){
		request.get(requestOptions("api/messages/"+id+"/likes"), function(error, response, likes) {
			if(error) {
				console.log("an error has occured. keep calm and carry on.");
			}
			cache.put("likes"+id, likes, 240000);
			callback(likes);
		});		
	}
	else{
		callback(l);
	}

}

exports.getMessages = function(callback){
	request.get(requestOptions("api/messages/"), function(error, response, messages) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		async.each(messages, function(message, done){
			getLikes(message.id, function(likes){
				message.likes = likes;
				done();
			});
		}, function(){
			callback(messages);
		});
	});
};

exports.getMessage = function(id, callback){
	request.get(requestOptions("api/messages/"+id), function(error, response, message) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		getLikes(message.id, function(likes){
			message.likes = likes;
			callback(message);
		});
	});
}

exports.getPercentage = function() {
	return [{ senioritet: "manager", prosentandel: 69 },
			{ senioritet: "senior", prosentandel: 13 },
			{ senioritet: "konsulent", prosentandel: 8 },
			{ senioritet: "trainee", prosentandel: 10}];
}

