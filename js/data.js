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

// Returns a key-value array of chromosomes and their mutation counts
function getChromosomeCounts(dataset) {
    chromosomes = {};
    dataset.forEach(function(entry) {
	number = entry['chromosome'];
	if (chromosomes[number] == null) {
	    chromosomes[number] = 1;
	} else {
	    chromosomes[number] += 1;
	}
    });

    return chromosomes;
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

/*
// https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
function buildChromosomeBarChart(chromosomes) {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);
    
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    d3.csv("./data/chromosomes.csv").then(function(error, data) {
	//if (error) throw error;

	// format the data
	data.forEach(function(d) {
	    d.Count = +d.Count;
	});

	// Scale the range of the data in the domains
	x.domain(data.map(function(d) { return d.Chromosome; }));
	y.domain([0, d3.max(data, function(d) { return d.Count; })]);

	// append the rectangles for the bar chart
	svg.selectAll(".bar")
	    .data(data)
	    .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.Chromosome); })
	    .attr("width", x.bandwidth())
	    .attr("y", function(d) { return y(d.Count); })
	    .attr("height", function(d) { return height - y(d.Count); });

	// add the x Axis
	svg.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
	    .call(d3.axisLeft(y));

    });
}
*/

function displaySeverity(sevObj) {
    for (const [disease, severity] of Object.entries(sevObj)) {	
	var fragment = document.createDocumentFragment();
	var element = document.createElement('p');
	element.innerHTML = disease + ' - ' + severity
	fragment.appendChild(element);
	document.getElementById("sev-list").appendChild(fragment);
    }
}

function displayChromosomes(chrObj) {
    i = 1;
    for (const [chr, count] of Object.entries(chrObj)) {
	var fragment = document.createDocumentFragment();
	var element = document.createElement('span');
	element.innerHTML = count;
	fragment.appendChild(element);
	document.getElementById("chr"+i.toString()).appendChild(fragment);
	i++;
    }
}

// Diseases and their counts
d = null;

// Organs and their counts
o = null;

// Chromosomes and their counts
c = null;

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
    c = getChromosomeCounts(dataset);
    topNSeverities = getTopNDiseasesBySeverity(5, s);
    diseaseNotes = getDiseaseNotes(dataset);
    buildOrganPieChart(o);
    // buildChromosomeBarChart(c);
    console.log(d);
    console.log(o);
    console.log(s);
    console.log(c);
    console.log(topNSeverities);
    console.log(diseaseNotes);
    displaySeverity(topNSeverities);
    displayChromosomes(c);
}, 100);
