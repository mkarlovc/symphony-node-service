function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

exports.extract_series_json = function(ts, fs, lbl) {
    var efs = {};
    for (var i=fs.win; i<ts.length; i++) {
        var ef = {};

        // true value
        if (fs.hasOwnProperty("true")) {
	    if (fs["true"]) {
                ef["true_"+lbl] = parseFloat(ts[i].count);
	    }
        }
        // moving window
        if (fs.hasOwnProperty("win_val")) {
	    if (fs["win_val"]) {
                for (var j=1; j<=fs.win; j++ ) {
                    ef["win_"+j+"_"+lbl] = parseFloat(ts[i-j].count);
                }
	    }
        }
        // simple moving sum
        if (fs.hasOwnProperty("sum")) {
	    if (fs["sum"]) {
                var smsum = 0.0;
                for (var j=1; j<=fs.win; j++ ) {
                    smsum += parseFloat(ts[i-j].count);
                }
                ef["sum_"+lbl] = smsum;
	    }
        }
        // simple moving avg
        if (fs.hasOwnProperty("avg")) {
	    if (fs["avg"]) {
                var smsum = 0.0;
                for (var j=1; j<=fs.win; j++ ) {
                    smsum += parseFloat(ts[i-j].count);
                }
                ef["avg_"+lbl] = parseFloat(smsum)/parseFloat(fs.win);
	    }
        }
        // derivative
        if (fs.hasOwnProperty("der")) {
            var last = parseFloat(ts[i-1].count);
            for (var j=1; j<=fs.der; j++ ) {
                ef["der_"+j+"_"+lbl] = last - parseFloat(ts[i-1-j].count);
            }
        }
        // collect
        efs[ts[i].date] = ef;
    }
    return efs;
};

exports.get_feature_set = function(efss) {
    var gfs = [];
    for (var i=0; i<efss.length; i++) {
        efs = efss[i];
	for (var index in efs) {
	    var ef = efs[index];
            for (var property in ef) {
	        if (gfs.indexOf(property) == -1) {
                    gfs.push(property);
	        }
	    }
        }
    }
    return gfs;
};

exports.get_ticks = function(efss) {
    var gfs = [];
    for (var i=0; i<efss.length; i++) {
        efs = efss[i];
        for (var property in efs) {
            if (gfs.indexOf(property) == -1) {
                gfs.push(property);
            }
        }
    }
    gfs.sort();
    return gfs;
};

exports.extract = function(efs, ticks, features) {
    var gfs = {};

    var newObj = {};
    for (var i=0; i<features.length; i++) {
        //newObj[features[i]] = null;
	newObj[features[i]] = 0;
    }

    for (var i=0; i<ticks.length; i++) {
        var gf = clone(newObj);
        for (var j=0; j<efs.length; j++) {
            if (efs[j].hasOwnProperty(ticks[i])){
                for (var k=0; k<features.length; k++) {
                    if (efs[j][ticks[i]].hasOwnProperty(features[k])){
                        gf[features[k]] = efs[j][ticks[i]][features[k]] 
                    }
                }
            }
        }
        gfs[ticks[i]] = gf;
    }
    return gfs;
};

exports.to_array = function(ext) {
    var exta = [];
    for (var property in ext) {
        exta.push(ext[property])
    }
    return exta;
}
