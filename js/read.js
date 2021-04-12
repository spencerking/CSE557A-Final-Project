dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
    //console.log(data[0]);
    dataset = data;
});

// This never sets the dataset variable, idk why
/*
function loadData() {
    d = null;
    d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
	//console.log(data[0]);
	//dataset = data;
	d = data;
    });

    return d;
}
*/

// https://stackoverflow.com/questions/6921895/synchronous-delay-in-code-execution
const syncWait = ms => {
    const end = Date.now() + ms
    while (Date.now() < end) continue
}

console.log(dataset);

//dataset = loadData();

// For some reason this still prints null
//syncWait(5000);
//console.log(dataset);

// This one prints out the data correctly
setTimeout(() => {  console.log(dataset); }, 100);
