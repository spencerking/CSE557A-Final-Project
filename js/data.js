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

function getTopNDiseasesBySeverity(n, disSev) {
    topn = {};
    ds = disSev;    
    i = 0;

    // Get critical diseases
    for (const [disease, severity] of Object.entries(ds)) {
	//console.log(key);
	//console.log(value);
	if (i == n) {
	    break;
	}
	
	if (severity == 'Critical') {
	    topn[disease] = severity;
	    i++;
	}
    }

    // Get chronic diseases
    for (const [disease, severity] of Object.entries(ds)) {
	if (i == n) {
	    break;
	}
	
	if (severity == 'Chronic') {
	    topn[disease] = severity;
	    i++;
	}
    }    
   
    // TODO:
    // Add more loops for additional severity levels

    return topn;
}

// Returns a key-value array of diseases and their notes
function getDiseaseNotes(dataset) {
    notes = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	note = entry['Notes'];
	if (notes[name] == null) {
	    notes[name] = note;
	} else {
	    // TODO:
	    // Can probably just remove this else and assume it'll all work fine
	    if (notes[name] != note) {
		console.log('This should never happen if I annotate the data right');
	    }
	}
    });

    return notes;
}

// Largely copied from: https://www.d3-graph-gallery.com/graph/pie_annotation.html
function buildOrganPieChart(organs) {
    // set the dimensions and margins of the graph
    var width = 450
    height = 450
    margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'organs-chart'
    var svg = d3.select("#organs-chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Prepare data
    var data = {}; //organs;

    // Sort borrowed from:
    // https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
    const sortable = Object.entries(organs)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    i = 0;
    otherCount = 0;
    for (const [key, value] of Object.entries(sortable)) {
	if (i < 5) {
	    data[key] = value;
	    i++;
	} else {
	    otherCount += value;
	}
    };
    data['Other'] = otherCount;
    
    // set the color scale
    var color = d3.scaleOrdinal()
	.domain(data)
	.range(d3.schemeSet2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
	.value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data))
    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
	.innerRadius(0)
	.outerRadius(radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
	.selectAll('mySlices')
	.data(data_ready)
	.enter()
	.append('path')
	.attr('d', arcGenerator)
	.attr('fill', function(d){ return(color(d.data.key)) })
	.attr("stroke", "black")
	.style("stroke-width", "2px")
	.style("opacity", 0.7)

    // Now add the annotation. Use the centroid method to get the best coordinates
    svg
	.selectAll('mySlices')
	.data(data_ready)
	.enter()
	.append('text')
	.text(function(d){ return d.data.key})
	.attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
	.style("text-anchor", "middle")
	.style("font-size", 17)
}

function displaySeverity(sevObj) {
    for (const [disease, severity] of Object.entries(sevObj)) {	
	var fragment = document.createDocumentFragment();
	var element = document.createElement('p');
	element.innerHTML = disease + ' - ' + severity
	fragment.appendChild(element);
	document.getElementById("sev-list").appendChild(fragment);
    }
}



// Diseases and their counts
d = null;

// Organs and their counts
o = null;

// Diseases and their severities
s = null;

// The top n diseases and their severities
topNSeverities = null;

// Diseases and their notes
diseaseNotes = null;

setTimeout(() => {
    d = uniqueDiseases(dataset);
    o = uniqueOrgans(dataset);
    s = diseaseSeverity(dataset);
    topNSeverities = getTopNDiseasesBySeverity(5, s);
    diseaseNotes = getDiseaseNotes(dataset);
    buildOrganPieChart(o);
    console.log(d);
    console.log(o);
    console.log(s);
    console.log(topNSeverities);
    console.log(diseaseNotes);
    displaySeverity(topNSeverities);
}, 100);
