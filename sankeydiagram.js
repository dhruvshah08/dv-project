data = ''

let nodes_arr = [];
let links_arr = [];
let journeySankey;

class Nodes{
    constructor(node, name){
        this.node = node;
        this.name = name;
    }
}
class Link{
    constructor(source, target, value){
        this.source = source;
        this.target = target;
        this.value   = value;
    }
}

class Direction{
    constructor(nodes, links){
        this.nodes = nodes;
        this.links = links;
    }
}

function appendSankeyMap(){
    
    svg = d3.select('#sankey_svg');
    
    svg.selectAll("*").remove();
   

    const width = +svg.style('width').replace('px','');
    const height = +svg.style('height').replace('px','');

    const margin = { top:100, bottom: 0, left: 100, right: 100};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const json_sankey = JSON.stringify(journeySankey);

    var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(10)
    .size([innerWidth, innerHeight]);


    graph = JSON.parse(json_sankey);
    // console.log(graph.nodes);
    // console.log(graph.links);

    console.log(graph);
    // console.log(graph.nodes);

  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(1);
    

//   // add in the links
  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

//   // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; })
      
//     console.log(graph.nodes);
//   // add the rectangles for the nodes
  node
    .append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth()*5)
      .attr("class", "sankey-node")
      .style("stroke", "black" )
    //   .on("mouseover", function(event,d) {
        
    //     d3.select(this)
    //       .style("stroke", "black")
    //       .style("stroke-width", 4);
        
    //     })
    //   .on("mouseout", function(event, d) {
       
    //     d3.select(this)
    //       .style("stroke", "black")
    //       .style("stroke-width", 1);
    //     })

//     // Add hover text


//   // add in the title for the nodes
    node
      .append("text")
        .attr("x", 100)
        .attr("y", function(d) { return d.dy / 2  + 50})
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
            return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 50 + sankey.nodeWidth())
        .attr("text-anchor", "start");
}

function collectData(){
    
    const transfers_path = '/Dataset/hospital/transfers.csv';
    const admissions_path = '/Dataset/hospital/admissions.csv';
    let set_of_dead = new Set();

    // Group: General Medicine
    const generalMedicine = [
        "Medicine",
        "Hematology/Oncology",
        "Hematology/Oncology Intermediate",
        "Medicine/Cardiology",
        "Medicine/Cardiology Intermediate",
        "Emergency Department Observation"
    ];
    
    // Group: Surgical Care
    const surgicalCare = [
        "Med/Surg",
        "Med/Surg/GYN",
        "Surgery/Trauma",
        "Cardiac Surgery",
        "Trauma SICU (TSICU)"
    ];
    
    // Group: Intensive Care
    const intensiveCare = [
        "Medical Intensive Care Unit (MICU)",
        "Surgical Intensive Care Unit (SICU)",
        "Cardiac Vascular Intensive Care Unit (CVICU)",
        "Neuro Surgical Intensive Care Unit (Neuro SICU)",
        "Medical/Surgical Intensive Care Unit (MICU/SICU)",
        "Neuro Intermediate",
        "Neuro Stepdown",
        "Coronary Care Unit (CCU)"
    ];
  
    // Group: Specialty Care
    const specialtyCare = [
        "Transplant",
        "PACU (Post Anesthesia Care Unit)",
        "Discharge Lounge"
    ];

    const freqMap = new Map();
    const nodes = new Set();
    let node_id = 0;
    const nodes_str = new Set();
    d3.csv(admissions_path).then(data => {
        set_of_dead = data.filter(d=> d.deathtime).map(d=>d.hadm_id);
        
        d3.csv(transfers_path).then(data => {
            
            data = data.filter(d=> d.hadm_id);
            
            const groupedData = d3.group(data, d => d.hadm_id);
            groupedData.forEach((values, key) => {
                // console.log(key);
                values.sort((a, b) => new Date(a.intime) - new Date(b.intime));
                
                values.forEach((row, index) => {
                    
                    if (index < values.length - 1) {
                        const hadm_id = row.hadm_id;
                        
                        const current_type = row.eventtype;
                        const next_type = values[index + 1].eventtype;
                        const current_cu = row.careunit;
                        const next_cu = values[index + 1].careunit;
                        let curr_group;
                        let next_group;
                        if(current_type=="admit"){
                            curr_group="Admit";
                        } if(current_type=="discharge"){
                            curr_group="Discharge";
                        }if(current_type=="ED"){
                            curr_group="Emergency Department";
                        }
                        else if(current_type=="transfer"){
                            // if(generalMedicine.includes(current_cu)){
                            //     curr_group = "General Medicine";
                            // }else if(surgicalCare.includes(current_cu)){
                            //     curr_group = "Surgical Care";
                            // }else if(intensiveCare.includes(current_cu)){
                            //     curr_group = "Intensive Care";
                            // }else {
                            //     curr_group = "Specialty Care";
                            // }
                            curr_group = "Care Units"
                        }
                        if(next_type==="admit"){
                            next_group="Admit";
                        }else if(next_type==="discharge"){
                            if(set_of_dead.includes(hadm_id)){
                                next_group="Dead";
                            }else{
                                next_group="Discharge";
                            }
                        }else if(next_type==="ED"){
                            next_group="Emergency Department";
                        }
                        else{
                            next_group = "Care Units";
                            // if(generalMedicine.includes(next_cu)){
                            //     next_group = "General Medicine";
                            // }else if(surgicalCare.includes(next_cu)){
                            //     next_group = "Surgical Care";
                            // }else if(intensiveCare.includes(next_cu)){
                            //     next_group = "Intensive Care";
                            // }else {
                            //     next_group = "Specialty Care";
                            // }
                        }
                        
                        if(!nodes_str.has(curr_group)){
                            
                            nodes.add(new Nodes(node_id, curr_group));
                            node_id+=1;
                        }
                        if(!nodes_str.has(next_group)){
                            // console.log(node_id + " " + next_group);
                            nodes.add(new Nodes(node_id, next_group));
                            node_id+=1;
                        }
                        nodes_str.add(curr_group);
                        nodes_str.add(next_group);
                        if(curr_group!=next_group){
                            const mapping = curr_group+"#"+next_group;
                            freqMap.set(mapping, (freqMap.get(mapping) || 0) + 1);
                        }
                        

                        
                    } 
                });

            });

            
            freqMap.forEach((value, key) => {
                const curr = key.split('#')[0];
                const next = key.split('#')[1];
                let curr_node_id = -1;
                let next_node_id = -1;
                for(let node1 of nodes){
                    
                    if(node1.name == curr){
                        curr_node_id = node1.node;
                    }
                    if(node1.name == next){
                        next_node_id = node1.node;
                    }
                }
                links_arr.push(new Link(curr_node_id, next_node_id, value));
            });
            nodes_arr = [...nodes];
            journeySankey = new Direction(nodes_arr, links_arr);
            
            appendSankeyMap();
           
        });
    });
    
   
}
collectData();