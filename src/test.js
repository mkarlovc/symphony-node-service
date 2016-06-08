var parse = require('./lib/parse.js');
var fs = {"win":5, "true":1, "sum":1, "avg":1};

var indexes1 = [1,2,3,4,5,6,7,8,9,10,11,12];
var ts1 = [1,2,3,4,5,6,7,8,9,10,11,12];
var s1 = parse.extract_series(ts1, fs);
var s1 = parse.append_label(s1, "a");

var indexes2 = [2,3,4,5,6,7,8,9,10];
var ts2 = [2,3,4,5,6,7,8,9,10];
var s2 = parse.extract_series(ts2, fs);
var s2 = parse.append_label(s2, "b");

var indexes3 = [1,2,3,6,7,8,9,10,11,12,13,14,15,16];
var ts3 = [1,2,3,6,7,8,9,10,11,12,14,15,16];
var s3 = parse.extract_series(ts3, fs);
var s3 = parse.append_label(s3, "c");

var allFeatures = parse.get_feature_set([s1, s2, s3]);

var s1 = parse.append_index(s1, indexes1.slice(fs.win,indexes1.length));
var s2 = parse.append_index(s2, indexes2.slice(fs.win,indexes2.length));
var s3 = parse.append_index(s3, indexes3.slice(fs.win,indexes3.length));

console.log(s1,s2,s3)

var allTicks = parse.get_ticks([s1, s2, s3]);

console.log(allFeatures,allTicks);

var ext = parse.extract([s1,s2,s3], allTicks, allFeatures);

console.log(parse.to_array(ext));
