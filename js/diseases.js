dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function (data) {
	//console.log(data[0]);
	dataset = data;
});

// Returns a key-value array of diseases and their mutation counts
function uniqueValues(column) {
	values = {};
	var name;
	dataset.forEach(function (entry) {
		name = entry[column];
		if (values[name] == null) {
			values[name] = 1;
		} else {
			values[name] += 1;
		}
	});

	return values;
}


// Returns a key-value array of diseases and their mutation counts
function uniqueDiseases(dataset) {
	diseases = {};
	dataset.forEach(function (entry) {
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
	dataset.forEach(function (entry) {
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
	dataset.forEach(function (entry) {
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
	dataset.forEach(function (entry) {
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

function setFilterType(value) {
	var select = document.getElementById("filter-value-select");
	var entry_values = uniqueValues(value);

	if (entry_values == null || entry_values.length == 0) {
		return;
	}

	var value_list = [];

	for (const val in entry_values) {
		if (entry_values.hasOwnProperty(val)) {
			value_list.push(val);
		}
	}

	while (select.firstChild) {
		select.removeChild(select.firstChild);
	}

	value_list.sort(function (a, b) {
		return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
	});
	var option = document.createElement("option");
	select.add(option);
	value_list.forEach(function (val) {
		var option = document.createElement("option");
		var pretty = val.toLocaleLowerCase();
		pretty = pretty[0].toUpperCase() + pretty.slice(1);
		option.text = pretty;
		option.value = val;
		select.add(option);
	});
}

function filterValues(value) {
	var filter_type = document.getElementById("filter-select").value;
	var main = document.getElementById("card-container");
	while (main.firstChild) {
		main.removeChild(main.firstChild);
	}
	dataset.forEach(function (row) {
		if (row[filter_type] == value) {
			createDiseaseCard(row["diseaseName"]);
			/*var card = document.createElement("div");
			card.classList.add("card");
			card.classList.add("mb-3");
			card.innerHTML = '<div class="card-body">\n'+JSON.stringify(row)+'</div>\n';			
			main.appendChild(card);*/
		}


	}
	);
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

// Functionality for Disease Card



function createDiseaseCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h5');
	title.innerText = disease;
	title.className = 'card-header d-flex justify-content-between align-items-center';

	var btn = document.createElement("BUTTON");
	btn.innerText = "-";
	btn.onclick = function () {
		cardBody.hidden = (btn.innerText === "+") ? '' : 'hidden';
		btn.innerText = (btn.innerText === "+") ? '-' : '+';
	};

	btn.classList.add("btn");
	btn.classList.add("btn-secondary");
	btn.classList.add("float-right");

	title.appendChild(btn);

	let genes = listOfGenesCard(disease);
	let diseaseInfo = diseaseInfoCard(disease);
	
	card.appendChild(title);
	cardBody.appendChild(diseaseInfo);
	cardBody.appendChild(genes);
	card.appendChild(cardBody);

	document.getElementById('card-container').appendChild(card);
}

function listOfGenesCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h6');
	title.innerText = "List of Genes";
	title.className = 'card-title';
	cardBody.appendChild(title);


	var genesID = new Set();
	dataset.forEach(function (entry) {
		if (entry['diseaseName'] == disease && !genesID.has(entry['gene_id'])) {
			var gene_symbol = document.createTextNode(entry['gene_symbol']);
			var div = document.createElement('div');
			div.appendChild(gene_symbol);
			cardBody.appendChild(div);
			genesID.add(entry['gene_id']);
		}
	});

	card.appendChild(cardBody);
	return card;
}


function diseaseInfoCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h6');
	title.innerText = "Disease Info";
	title.className = 'card-title';
	cardBody.appendChild(title);


	var consequences = new Set();
	var organs = new Set();
	var severity = new Set();
	dataset.forEach(function (entry) {
		if (entry['diseaseName'] == disease) {
			consequences.add(entry['major_consequence']);
			organs.add(entry['Organ']);
			severity.add(entry['Severity']);
		}
	});

	console.log(severity);
	cardBody = straightenLists(cardBody, consequences, "Consequences");
	cardBody = straightenLists(cardBody, organs, "Organs");
	cardBody = straightenLists(cardBody, severity, "Severity");

	card.appendChild(cardBody);
	return card;

}

function straightenLists(cardBody, setOrigin, title) {
	if (setOrigin.size > 1) {
		var div = document.createElement('div');
		var text = document.createTextNode(title + ": " + Array.from(setOrigin).join(", "));
		div.appendChild(text);
		cardBody.appendChild(div);
	} else {
		var div = document.createElement('div');
		var text = document.createTextNode(title + ": " + Array.from(setOrigin)[0]);
		div.appendChild(text);
		cardBody.appendChild(div);
	}

	return cardBody
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
	console.log(d);
	console.log(o);
	console.log(s);
	console.log(topNSeverities);
	console.log(diseaseNotes);
	setFilterType(document.getElementById("filter-select").value);
}, 100);
