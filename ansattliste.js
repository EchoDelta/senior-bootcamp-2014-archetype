var request = require('request');
var url = process.env.URL_ANSATT;
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

exports.getByName = function(name, callback){
	request.get(requestOptions("search?q="+name), function(error, response, body) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		callback(body);
	});
};