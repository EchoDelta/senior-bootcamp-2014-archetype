var request = require('request');
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

exports.getMessages = function(callback){
	request.get(requestOptions("api/messages/"), function(error, response, body) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		callback(body);
	});
};

exports.getMessage = function(id, callback){
	request.get(requestOptions("api/messages/"+id), function(error, response, body) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		callback(body);
	});
}