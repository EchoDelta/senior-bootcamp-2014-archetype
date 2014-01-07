var quiche = require('quiche');

exports.VisualizeThatShit = function(stats) {
  var pie = new quiche('pie');
  var colors = ["F229BD", "7A29F2", "139C5C", "EBD913"];

  for(var i = 0; i < stats.length; i++ ){
    pie.addData(stats[i].prosent, stats[i].senioritet + ": " + stats[i].prosent.toFixed(2) + "%", colors[i]);
  }
  pie.setTransparentBackground();
  pie.setWidth(600);
  pie.setHeight(400);

  return pie.getUrl(true);
};


exports.MessagesPerSeniority = function(messages) {
  var messageSeniorityMap = {};
  for(var i = 0; i<messages.length; i++){
    var seniority = messages[i].user.senioritet;

    if(messageSeniorityMap[seniority]){
      messageSeniorityMap[seniority]++;
    }
    else{
      messageSeniorityMap[seniority] = 1;
    }
  }

  var seniorityStatisticsArray = [];
  for(var key in messageSeniorityMap){
    var s = key;
    var a = messageSeniorityMap[key];

    seniorityStatisticsArray.push({senioritet: s, prosent: (a/messages.length*100), antall: a});
  }
  return seniorityStatisticsArray;
};