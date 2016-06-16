var express = require('express');
var app = express();
var analytics = require('./lib/analytics.js');
var parse = require('./lib/parse.js');
var bodyParser = require('body-parser');
var fs = require('fs');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(express.static('public'));
app.use(express.static('files'));
app.use(bodyParser.json({limit: '50mb', parameterLimit: 100000}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000, extended: true})); // to support URL-encoded bodies
app.use(allowCrossDomain);

app.post('/nc', function(req, res) {
    var data = req.body;

    var indicator = data.indicator;
    var socialMedia = data.socialMedia;
    console.log(indicator);
    console.log(socialMedia);

    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1};
    var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};

    var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
    var smFs = [];
    for (var i=0; i<socialMedia.length; i++) {
        smFs.push(parse.extract_series_json(socialMedia[i], fsSm , "sm"+i.toString()));
    }

    smFs.unshift(indicatorF);
    var allF = smFs;    

    var allFeatures = parse.get_feature_set(allF);
    var allTicks = parse.get_ticks(allF);
    var ext = parse.extract(allF, allTicks, allFeatures);
    
    var ftr = analytics.create_featurespace(parse.to_array(ext));
    var mat = analytics.add_data(parse.to_array(ext), ftr);
    var pred = analytics.svr(mat);
    var mse = analytics.mse(pred);

    var j=0;
    for (var i=pred.length-1; i>=0; i--) {
        pred[i].date = allTicks[allTicks.length-1-j];
        j += 1;
    }

    res.send({"prediction":pred, "validation":{"MSE": mse}});
});
 
app.get('/', function (req, res) {
    res.send('Hello World')
});
 
app.listen(3001)
