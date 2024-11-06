let stays = [];
const vitals_path  = '/Dataset/icu/chartevents.csv';
const medicatons_path = '/Dataset/icu/medicationinput.csv';
let selected_data;
document.addEventListener("DOMContentLoaded", function() {
    let setOfStays = new Set();
    d3.csv(vitals_path).then(data => {
        data.map(d=>{
            setOfStays.add(d["hadm_id"]);
        });
        stays = Array.from(setOfStays).sort();
        var stay_select = document.getElementById('stay_select');
        stays.forEach(function(col_name){
            var new_option = document.createElement('option');
            new_option.value = col_name;
            new_option.text = col_name;
            stay_select.appendChild(new_option);  
        });
        document.getElementById('stay_select').value = stays[0];
        getData();
    });
   
  });

function removeAllOptions(id){
    const selectObj = document.getElementById(id);
    while (selectObj.options.length > 0) {
        selectObj.remove(0);
    }
}
function getData(){
    const stay_id = document.getElementById('stay_select').value;
    const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    d3.csv(vitals_path).then(data => {
        individual_data = data.filter(d=>d["hadm_id"]==stay_id)
        .map(d => ({
            hadm_id: +d["hadm_id"],
            item_id: +d["itemid"],
            valuenum: +d["valuenum"],
            charttime: parseTime(d["charttime"])
        }));
        selected_data = individual_data;
        drawHeartChart();
        drawOxygenChart();
        drawRespChart();
    });
    
}

function drawHeartChart(){
    // console.log('here!');
    var margin = {top: 20, right: 50, bottom: 20, left: 20},
    width = 1050 - margin.left - margin.right,
    height = 175 - margin.top - margin.bottom;
    const filtered_data = selected_data.filter(data=>data["item_id"]==220045)
    .sort((a, b) => new Date(a["charttime"]) - new Date(b["charttime"]));;
    // console.log(filtered_data);
    
    // console.log(d3.extent(filtered_data, function(d) { return d.charttime; }));

    var svg = d3.select("#hr_chart")
    svg
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
        
    var x = d3.scaleTime()
        .domain(d3.extent(filtered_data, function(d) { return d.charttime; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(45," + (height+10) + ")")
        .call(d3.axisBottom(x));

    
    var y = d3.scaleLinear()
        .domain([d3.min(filtered_data, function(d) { return +d.valuenum; }), d3.max(filtered_data, function(d) { return +d.valuenum; })])
        .range([ height, 0 ]);
    svg.append("g")
    .attr("transform", "translate(50," + 15 + ")")
        .call(d3.axisLeft(y));
    
    svg.append("path")
        .datum(filtered_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.charttime) +50})
            .y(function(d) { return y(d.valuenum) })
            )
    
}
function drawOxygenChart(){
    var margin = {top: 20, right: 50, bottom: 20, left: 20},
    width = 1050 - margin.left - margin.right,
    height = 175 - margin.top - margin.bottom;
    const filtered_data = selected_data.filter(data=>data["item_id"]==220277)
    .sort((a, b) => new Date(a["charttime"]) - new Date(b["charttime"]));
    // console.log(filtered_data);
    
    // console.log(d3.extent(filtered_data, function(d) { return d.charttime; }));

    var svg = d3.select("#o2_chart")
    svg
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
        
    var x = d3.scaleTime()
        .domain(d3.extent(filtered_data, function(d) { return d.charttime; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(45," + (height+10) + ")")
        .call(d3.axisBottom(x));

    
    var y = d3.scaleLinear()
        .domain([d3.min(filtered_data, function(d) { return +d.valuenum; }), d3.max(filtered_data, function(d) { return +d.valuenum; })])
        .range([ height, 0 ]);
    svg.append("g")
    .attr("transform", "translate(50," + 15 + ")")
        .call(d3.axisLeft(y));
    
    svg.append("path")
        .datum(filtered_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.charttime)})
            .y(function(d) { return y(d.valuenum) })
            .curve(d3.curveMonotoneX)
            )
}
function drawRespChart(){
    var margin = {top: 20, right: 50, bottom: 20, left: 20},
    width = 1050 - margin.left - margin.right,
    height = 175 - margin.top - margin.bottom;
    const filtered_data = selected_data.filter(data=>data["item_id"]==220179 || data["item_id"]==220180)
    .sort((a, b) => new Date(a["charttime"]) - new Date(b["charttime"]));
    // console.log(filtered_data);
    
    // console.log(d3.extent(filtered_data, function(d) { return d.charttime; }));

    var svg = d3.select("#bp_chart")
    svg
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
        
    var x = d3.scaleTime()
        .domain(d3.extent(filtered_data, function(d) { return d.charttime; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(45," + (height+10) + ")")
        .call(d3.axisBottom(x));

    
    var y = d3.scaleLinear()
        .domain([d3.min(filtered_data, function(d) { return +d.valuenum; }), d3.max(filtered_data, function(d) { return +d.valuenum; })])
        .range([ height, 0 ]);
    svg.append("g")
    .attr("transform", "translate(50," + 15 + ")")
        .call(d3.axisLeft(y));
    
    svg.append("path")
        .datum(filtered_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.charttime)})
            .y(function(d) { return y(d.valuenum) })
            .curve(d3.curveCatmullRom.alpha(0.5))
            )
}