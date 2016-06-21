var express = require('express');
var app = express();
var analytics = require('./lib/analytics.js');
var qdata = require('./lib/data.js');
var parse = require('./lib/parse.js');
var bodyParser = require('body-parser');
var fs = require('fs');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(express.static('public'));
app.use(express.static('files'));
app.use(bodyParser.json({limit: '50mb', parameterLimit: 100000}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000, extended: true})); // to support URL-encoded bodies
app.use(allowCrossDomain);

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

app.post('/nc', function(req, res) {
    try{
    var data = req.body;
    var indicator = data.indicator;
	
	var model = data.model;
	
	indicator = parse.sort_json_by_ticks(indicator);
	
    var socialMedia = data.er;

    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1, "month": true, "day": true};
    var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};
 
    var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
    var smFs = [];
    for (var i=0; i<socialMedia.length; i++) {
	    var sm = parse.sort_json_by_ticks(socialMedia[i]);
        smFs.push(parse.extract_series_json(sm, fsSm , "sm"+i.toString()));
    }

    smFs.unshift(indicatorF);
    var allF = smFs;    

    var allFeatures = parse.get_feature_set(allF);
    //var allTicks = parse.get_ticks(allF);
    var allTicks = parse.get_ticks([indicatorF]);
	var ext = parse.extract(allF, allTicks, allFeatures);
    
    var ftr = analytics.create_featurespace(parse.to_array(ext));
    var mat = analytics.add_data(parse.to_array(ext), ftr);
	
	var pred = null;
	if (model == "SVM") {
        pred = analytics.svr(mat);
	}
	else {
	    pred = analytics.rrg(mat);
	}
	
    var mse = analytics.mse(pred);

    var j=0;
    for (var i=pred.length-1; i>=0; i--) {
        pred[i].date = allTicks[allTicks.length-1-j];
        j += 1;
    }

    res.send({"prediction":pred, "validation":{"MSE": mse}});
    }
	catch (err) {
	    console.log(err);
	}
});

app.post('/ar', function(req, res) {
    
    var data = req.body;
    var indicator = data.indicator;
	indicator = parse.sort_json_by_ticks(indicator);
	
    var socialMedia = [];

    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":false, "avg":true, "der":0, "month": false, "day": false};
    var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};

    var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
    var smFs = [];
    for (var i=0; i<socialMedia.length; i++) {
	    var sm = parse.sort_json_by_ticks(socialMedia[i]);
        smFs.push(parse.extract_series_json(sm, fsSm , "sm"+i.toString()));
    }

    smFs.unshift(indicatorF);
    var allF = smFs;    

    var allFeatures = parse.get_feature_set(allF);
    //var allTicks = parse.get_ticks(allF);
    var allTicks = parse.get_ticks([indicatorF]);
	var ext = parse.extract(allF, allTicks, allFeatures);
    
    var ftr = analytics.create_featurespace(parse.to_array(ext));
    var mat = analytics.add_data(parse.to_array(ext), ftr);
    var pred = analytics.rrg(mat);
    var mse = analytics.mse(pred);

    var j=0;
    for (var i=pred.length-1; i>=0; i--) {
        pred[i].date = allTicks[allTicks.length-1-j];
        j += 1;
    }

    res.send({"prediction":pred, "validation":{"MSE": mse}});
    /*}
	catch (err) {
	    console.log(err);
	}*/
});

app.post('/opec_f_news', function(req, res) {
    try {
    var data = req.body;
	var steps = data.steps;
	var step = data.step; //days
	
    var indicator = qdata.data.opec;
    var socData = var socData = [qdata.data.barrel_news, qdata.data.gasoline_news, qdata.data.oil_news, qdata.data.energy_news, qdata.data.dollar_news];
	
    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1, "month": true, "day": true};
 	var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};
		
	pred = [];
	
	for (var i=0; i<steps; i++) {
	    indicator = parse.sort_json_by_ticks(indicator);
		
		var indicatorTicks = parse.ticks_from_json(indicator);
		var lastTick = indicatorTicks[indicatorTicks.length-1];
	    var currDate = new Date(lastTick);
		var newDate = new Date(currDate.getTime() + (86400000 * step));
	    var newTick = newDate.getFullYear()+'-'+zeroPad(newDate.getMonth()+1, 2)+'-'+zeroPad(newDate.getDate(), 2);
	    
		indicator.push({'date': newTick, 'count': -1});
		
        var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
        		
	    var smFs = [];
        
		for (var j=0; j<socData; j++) {
	        var sd = parse.sort_json_by_ticks(socData[j]);
            smFs.push(parse.extract_series_json(sd, fsSm, "sd"+(j+1)));
		}
		
		smFs.unshift(indicatorF);
        var allF = smFs;    
        var allFeatures = parse.get_feature_set(allF);
		var allTicks = parse.get_ticks([indicatorF]);
		
		var ext = parse.extract(allF, allTicks, allFeatures);
        
		var ftr = analytics.create_featurespace(parse.to_array(ext));
        var mat = analytics.add_data(parse.to_array(ext), ftr);
         
		var pred_val = analytics.rrg1(mat);
	
	    indicator.pop();
	    indicator.push({'date': newTick, 'count': pred_val});
        pred.push({'date': newTick, 'count': pred_val});
	}

    res.send({"prediction":pred});
	}
	catch (err) {
	    console.log(err);
	}
});

app.post('/opec_f_sm', function(req, res) {
    try {
    var data = req.body;
	var steps = data.steps;
	var step = data.step; //days
	
    var indicator = qdata.data.opec;
    var socData = [qdata.data.barrel_social, qdata.data.gasoline_social, qdata.data.oil_social, qdata.data.energy_social, qdata.data.dollar_social];
	
    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1, "month": true, "day": true};
 	var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};
		
	pred = [];
	
	for (var i=0; i<steps; i++) {
	    indicator = parse.sort_json_by_ticks(indicator);
		
		var indicatorTicks = parse.ticks_from_json(indicator);
		var lastTick = indicatorTicks[indicatorTicks.length-1];
	    var currDate = new Date(lastTick);
		var newDate = new Date(currDate.getTime() + (86400000 * step));
	    var newTick = newDate.getFullYear()+'-'+zeroPad(newDate.getMonth()+1, 2)+'-'+zeroPad(newDate.getDate(), 2);
	    
		indicator.push({'date': newTick, 'count': -1});
		
        var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
        		
	    var smFs = [];
        
		for (var j=0; j<socData; j++) {
	        var sd = parse.sort_json_by_ticks(socData[j]);
            smFs.push(parse.extract_series_json(sd, fsSm, "sd"+(j+1)));
		}
		
		smFs.unshift(indicatorF);
        var allF = smFs;    
        var allFeatures = parse.get_feature_set(allF);
		var allTicks = parse.get_ticks([indicatorF]);
		
		var ext = parse.extract(allF, allTicks, allFeatures);
        
		var ftr = analytics.create_featurespace(parse.to_array(ext));
        var mat = analytics.add_data(parse.to_array(ext), ftr);
         
		var pred_val = analytics.rrg1(mat);
	
	    indicator.pop();
	    indicator.push({'date': newTick, 'count': pred_val});
        pred.push({'date': newTick, 'count': pred_val});
	}

    res.send({"prediction":pred});
	}
	catch (err) {
	    console.log(err);
	}
});

app.post('/opec_f_ar', function(req, res) {
    try {
    var data = req.body;
	var steps = data.steps;
	var step = data.step; //days
	
    var indicator = qdata.data.opec;
    var socData = [];
	
    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1, "month": true, "day": true};
 	var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};
		
	pred = [];
	
	for (var i=0; i<steps; i++) {
	    indicator = parse.sort_json_by_ticks(indicator);
		
		var indicatorTicks = parse.ticks_from_json(indicator);
		var lastTick = indicatorTicks[indicatorTicks.length-1];
	    var currDate = new Date(lastTick);
		var newDate = new Date(currDate.getTime() + (86400000 * step));
	    var newTick = newDate.getFullYear()+'-'+zeroPad(newDate.getMonth()+1, 2)+'-'+zeroPad(newDate.getDate(), 2);
	    
		indicator.push({'date': newTick, 'count': -1});
		
        var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
        		
	    var smFs = [];
        
		for (var j=0; j<socData; j++) {
	        var sd = parse.sort_json_by_ticks(socData[j]);
            smFs.push(parse.extract_series_json(sd, fsSm, "sd"+(j+1)));
		}
		
		smFs.unshift(indicatorF);
        var allF = smFs;    
        var allFeatures = parse.get_feature_set(allF);
		var allTicks = parse.get_ticks([indicatorF]);
		
		var ext = parse.extract(allF, allTicks, allFeatures);
        
		var ftr = analytics.create_featurespace(parse.to_array(ext));
        var mat = analytics.add_data(parse.to_array(ext), ftr);
         
		var pred_val = analytics.rrg1(mat);
	
	    indicator.pop();
	    indicator.push({'date': newTick, 'count': pred_val});
        pred.push({'date': newTick, 'count': pred_val});
	}

    res.send({"prediction":pred});
	}
	catch (err) {
	    console.log(err);
	}
});

app.post('/opec', function(req, res) {
    try{
    var data = req.body;
	
    var indicator = qdata.data.opec;
    var socData = [qdata.data.bank_social_tp, qdata.data.industry_geo_tp];
	
    var fsIndicator = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true, "der":1, "day":true, "month":true};
    //var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};
	var fsSm = {"win":5, "win_val": true, "true": true, "sum":true, "avg":true};

	indicator = parse.sort_json_by_ticks(indicator);
    var indicatorF = parse.extract_series_json(indicator, fsIndicator, "ind");
    var smFs = [];

	for (var i=0; i<socData.length; i++) { 
	    var sd = parse.sort_json_by_ticks(socData[i]);
        smFs.push(parse.extract_series_json(sd, fsSm , "sd"+i));
    }
	
    smFs.unshift(indicatorF);
    var allF = smFs;    

    var allFeatures = parse.get_feature_set(allF);
    //var allTicks = parse.get_ticks(allF);
    var allTicks = parse.get_ticks([indicatorF]);
	var ext = parse.extract(allF, allTicks, allFeatures);
    
    var ftr = analytics.create_featurespace(parse.to_array(ext));
    var mat = analytics.add_data(parse.to_array(ext), ftr);
    var pred = analytics.rrg(mat);
    var mse = analytics.mse(pred);

    var j=0;
    for (var i=pred.length-1; i>=0; i--) {
        pred[i].date = allTicks[allTicks.length-1-j];
        j += 1;
    }

    res.send({"prediction":pred, "validation":{"MSE": mse}});
    }
	catch (err) {
	    console.log(err);
	}
});
 
app.get('/', function (req, res) {
    res.send('Hello World')
});
 
app.listen(3001)
