var quiche = require('quiche');

exports.VisualizeThatShit = function(stats) {
  var pie = new quiche('pie');
  var colors = ["F229BD", "7A29F2", "139C5C", "EBD913"];

  for(var i = 0; i < stats.length; i++ ){
    pie.addData(stats[i].prosent, stats[i].senioritet + ": " + stats[i].prosent + "%", colors[i]);
  }
  pie.setTransparentBackground();
  pie.setWidth(600);
  pie.setHeight(400);

  return pie.getUrl(true);
};