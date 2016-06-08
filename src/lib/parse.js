var qminer = require('qminer');

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

exports.extract_series = function(ts, fs) {
    var efs = [];
    for (var i=fs.win; i<ts.length; i++) {
	var ef = {};
	
	// true value
	if (fs.hasOwnProperty("true")) {
	    ef["true"] = ts[i];
	}
        // moving window
	if (fs.hasOwnProperty("win")) {
	    for (var j=1; j<=fs.win; j++ ) {
	        ef["win_"+j] = ts[i-j];
	    }
	}
	// simple moving sum
	if (fs.hasOwnProperty("sum")) {
            var smsum = 0;
            for (var j=1; j<=fs.win; j++ ) {
                smsum += ts[i-j];
            }
            ef.sum = smsum;
	}
	// simple moving avg
        if (fs.hasOwnProperty("avg")) { 
	    var smsum = 0;
            for (var j=1; j<=fs.win; j++ ) {
                smsum += ts[i-j];
            }
            ef.avg = smsum/fs.win;
	}
        // collect
        efs.push(ef);
    }
    return efs;
};

exports.append_label = function(efs, label) {
    var efs2 = [];
    for (var i=0; i<efs.length; i++) {
        var ef = efs[i];
        var ef2 = {};
        for (var property in ef) {
            if (ef.hasOwnProperty(property)) {
                ef2[property+"_"+label] = ef[property];
            }
        }
        efs2.push(ef2);
    }
    return efs2;
}

exports.append_index = function(efs, idxs) {
    var efs2 = {};
    for (var i=0; i<efs.length; i++) {
        efs2[idxs[i]] = efs[i];
    }
    return efs2;
};

exports.get_feature_set = function(efss) {
    var gfs = [];
    for (var i=0; i<efss.length; i++) {
        efs = efss[i];
	for (var j=0; j<efs.length; j++) {
	    var ef = efs[j];
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
        newObj[features[i]] = null;
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
