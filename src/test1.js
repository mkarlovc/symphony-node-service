var parse = require('./lib/parse.js');
var analytics = require('./lib/analytics.js');

var index = [{"date":"2016-01-01", "count": 11},{"date":"2016-01-02", "count": 12},{"date":"2016-01-03", "count": 13},{"date":"2016-01-04", "count": 14},{"date":"2016-01-05", "count": 15}];

var fs = {"win":2, "win_val": true, "true": true, "sum":true, "avg":true, "der":1};

var index = parse.extract_series_json(index, fs, "index");

var c1 = [{"date":"2016-01-01", "count": 21},{"date":"2016-01-02", "count": 22},{"date":"2016-01-03", "count": 23},{"date":"2016-01-04", "count": 24},{"date":"2016-01-05", "count": 25}];
var c2 = [{"date":"2016-01-01", "count": 18},{"date":"2016-01-02", "count": 20},{"date":"2016-01-03", "count": 21},{"date":"2016-01-04", "count": 26},{"date":"2016-01-05", "count": 28}];

var fs1 = {"win":2, "win_val": true, "true": true, "sum":true, "avg":true};

var c1 = parse.extract_series_json(c1, fs1, "c1");
var c2 = parse.extract_series_json(c2, fs1, "c2");

var fs2 = {"win":2, "win_val": false, "true": true, "sum":false, "avg":false};
var tp = [{"date":"2016-01-01", "count": 0},{"date":"2016-01-02", "count": 0},{"date":"2016-01-03", "count": 1},{"date":"2016-01-04", "count": 0},{"date":"2016-01-05", "count": 1}];
var tp = parse.extract_series_json(tp, fs2, "tp");


var allFeatures = parse.get_feature_set([index, c1, c2, tp]);
var allTicks = parse.get_ticks([index, c1, c2, tp]);

var ext = parse.extract([index, c1, c2, tp], allTicks, allFeatures);

var ftr = analytics.create_featurespace(parse.to_array(ext));
var mat = analytics.add_data(parse.to_array(ext), ftr);
var pred = analytics.svr(mat);

for (var i=0; i<allTicks; i++) {
    console.log(allTicks[i]);
}

var mse = analytics.mse(pred);
console.log("mse: "+mse);
