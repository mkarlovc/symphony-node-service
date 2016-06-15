var qm = require('qminer');
var analytics = require('qminer').analytics;

exports.base;

exports.create_featurespace = function(ext) {
    if (ext.length == 0) {
	console.log("Expected array with at least one element.");
        return;
    }

    // extract features from input
    var fields = []
    for (var i=0; i<Object.keys(ext[0]).length; i++) {
        fields.push({"name": Object.keys(ext[0])[i], "type": "float"});
    }
   
    // create base
    this.base = new qm.Base({"mode": "createClean", "schema": {"name": "FtrSpace", "fields":fields, "joins": [], "keys": []}});
   
    // create feature spaces
    var ftr = new qm.FeatureSpace(this.base, { type: "numeric", source: "FtrSpace", field: fields[0].name, "null": true });
    for (var i=1; i<fields.length; i++) {
        ftr.addFeatureExtractor({ "type": "numeric", "source": "FtrSpace", "field": fields[i].name, "null": true });
    }
    
    return ftr;	
}

exports.add_data = function(ext, ftr) {
    if (ext.length == 0) {
        console.log("Expected array with at least one element.");
        return;
    }
    
    var Store = this.base.store("FtrSpace"); 
    for (var i=0; i<ext.length; i++) {
        Store.push(ext[i]);
    }
    
    ftr.updateRecords(Store.allRecords);
    var matrix = ftr.extractMatrix(Store.allRecords);
    return matrix;
}

exports.svr = function(matrix) {
    var learning = matrix.getSubmatrix(1,matrix.rows,0,matrix.cols);
    var targets = matrix.getRow(0);
    var SVR = new analytics.SVR({ verbose: false });
    var vec = [0];
    var out = [];
    for (var i=1; i<learning.cols; i++) {
	var mat = learning.getSubmatrix(0, learning.rows, 0, i);
	var tar = targets.subVec(vec);
        SVR.fit(mat, tar);
        var test = learning.getCol(i);
        var prediction = SVR.predict(test);
	console.log({"predicted": prediction, "actual": targets.at(i)});
	out.push({"predicted": prediction, "actual": targets.at(i)});
	vec.push(i);
    }
    return out;
}
