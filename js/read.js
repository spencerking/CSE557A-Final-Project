dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
    //console.log(data[0]);
    dataset = data;
});

/*function loadData() {
    const dataset = d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
	return data;
    });

    x = null
    dataset.then(function(value) {
	x =  value;
    });

    return x;
}

dataset = loadData();
*/

// Returns a key-value array of diseases and their mutation counts
function uniqueDiseases(dataset) {
    diseases = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	if (diseases[name] == null) {
	    diseases[name] = 1;
	} else {
	    diseases[name] += 1;
	}
    });

    return diseases;
}

// Returns a key-value array of organs and their mutation counts
function uniqueOrgans(dataset) {
    organs = {};
    dataset.forEach(function(entry) {
	name = entry['Organ'];
	if (organs[name] == null) {
	    organs[name] = 1;
	} else {
	    organs[name] += 1;
	}
    });

    return organs;
}

// Returns a key-value array of diseases and their severity
function diseaseSeverity(dataset) {
    severity = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	if (severity[name] == null) {
	    severity[name] = entry['Severity'];
	} else {
	    // TODO:
	    // Can probably just remove this else and assume it'll all work fine
	    if (severity[name] != entry['Severity']) {
		console.log('This should never happen if I annotate the data right');
	    }
	}
    });

    return severity;
}

d = null;
o = null;
s = null;
    
setTimeout(() => {
    d = uniqueDiseases(dataset);
    o = uniqueOrgans(dataset);
    s = diseaseSeverity(dataset);
    console.log(d);
    console.log(o);
    console.log(s);
}, 100);
