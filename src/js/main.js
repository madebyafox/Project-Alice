import '../css/styles.css'
import '../css/svg-styles.css'

//NOTE: ARCHIVED CODE, NOT USED IN HATTER v0.2
//USES https://developer.chrome.com/extensions/windows

//note: imported d3 library (main) in main.html
const width = 954;
const currWindowDiv = "#thisWindowDiv";  // TODO: don't hardcode this
const allWindowDiv = "#allWindowsDiv"//TODO: don't hardcode this
const tabsDiv = "#tabsDiv";  // TODO: don't hardcode this
const navDiv = "#navigationDiv";  // TODO: don't hardcode this
const margin = ({top: 10, right: 120, bottom: 10, left: 40})


//THE RABBIT HOLE OBJECT
let rabbitHole = { //object literal syntax
  createdAt: new Date().getDate(),
  structure: function(data){
    // console.log("setting structure");
    return data;} //a setter
};

//PROMISE VERSION
function loadAllTabs(query){
  return new Promise(
    function (resolve, reject){
      chrome.tabs.query({}, function(tabs){
        resolve({"tabs":tabs}); //convert result to object
        reject("load error");
      });
    });
}

//WORKING PROMISE VERSION
function loadCurrentWindow(query) {
  return new Promise (
    function (resolve, reject){
      chrome.windows.getCurrent({"populate" : true}, function(result){
        resolve(result);
        reject("load error");
      });
    });
}

//WORKING PROMISE VERSION
function loadAllWindows(query){
  return new Promise(
    function (resolve, reject){
      chrome.windows.getAll({"populate" : true}, function(result){
        resolve({"tabs":result}); //convert result to object
        reject("load error");
      });
    });
}

//CREATE A D3 TREE STRUCTURE FROM THE API DATA
function tree (data) {
  // console.log("making tree")
  const root = d3.hierarchy(data, function children(d) {
    return d.tabs;
  });

  // console.log("print root: ");
  // console.log(root);

  root.dx = 10;
  root.dy = width / (root.height + 1);
  return d3.tree().nodeSize([root.dx, root.dy])(root);
}

//D3 TREE CHART https://observablehq.com/d/a674c57445e300aa
function staticChart(data, location) {
  console.log("making chart");
  console.log(data);
  const root = tree(data);

  let x0 = Infinity;
  let x1 = -x0;

  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  // const parent = document.querySelector("#canvas");
  const parent = d3.select(location);

  const svg = parent.append("svg")
      .attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 2]);

  const g = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

  const link = g.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));

  const node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

  node.append("image")
       .attr("href", d => d.data.favIconUrl)
       .attr("height", 5)
       .attr("width",5);

  node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.title)
      .clone(true).lower()
      .attr("stroke", "white");

  return svg.node();
}

//not working
function foldingChart(data, location) {
  console.log("making a folding chart");
  console.log(data);

  let dx = 10;
  let dy = width/6;

  let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  let tree = data => {
   const root = d3.hierarchy(data, function children(d) {
       return d.tabs;
   });
   // return d3.tree().nodeSize([root.dx, root.dy])(root);
   return d3.tree().nodeSize([dx,dy])(root);
 }

 const root = tree(data);

 //LOGGING -------------
 console.log("printing root");
 console.log(root);

 console.log("printing root descendants");
 console.log(root.descendants());


 root.x0 = dy / 2;
 root.y0 = 0;
 root.descendants().forEach((d, i) => {
   d.id = i;
   d._children = d.children;
   if (d.depth && d.data.id.length !== 7) d.children = null;
 });

 //Create the SVG
 const svg = d3.create("svg")
     .attr("viewBox", [-margin.left, -margin.top, width, dx])
     .style("font", "10px sans-serif")
     .style("user-select", "none");

 const gLink = svg.append("g")
     .attr("fill", "none")
     .attr("stroke", "#555")
     .attr("stroke-opacity", 0.4)
     .attr("stroke-width", 1.5);

 const gNode = svg.append("g")
     .attr("cursor", "pointer")
     .attr("pointer-events", "all");

 function update(source) {
   const duration = d3.event && d3.event.altKey ? 2500 : 250;
   const nodes = root.descendants().reverse();
   const links = root.links();

   // Compute the new tree layout.
   tree(root);

   let left = root;
   let right = root;
   root.eachBefore(node => {
     if (node.x < left.x) left = node;
     if (node.x > right.x) right = node;
   });

   const height = right.x - left.x + margin.top + margin.bottom;

   const transition = svg.transition()
       .duration(duration)
       .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
       .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

   // Update the nodes…
   const node = gNode.selectAll("g")
     .data(nodes, d => d.id);

   // Enter any new nodes at the parent's previous position.
   const nodeEnter = node.enter().append("g")
       .attr("transform", d => `translate(${source.y0},${source.x0})`)
       .attr("fill-opacity", 0)
       .attr("stroke-opacity", 0)
       .on("click", d => {
         d.children = d.children ? null : d._children;
         update(d);
       });

   nodeEnter.append("circle")
       .attr("r", 2.5)
       .attr("fill", d => d._children ? "#555" : "#999")
       .attr("stroke-width", 10);

   nodeEnter.append("image")
       .attr("href", d => d.data.favIconUrl)
       .attr("height", 5)
       .attr("width",5);

   nodeEnter.append("text")
       .attr("dy", "0.31em")
       .attr("x", d => d._children ? -6 : 6)
       .attr("text-anchor", d => d._children ? "end" : "start")
       .text(d => d.data.title)
     .clone(true).lower()
       .attr("stroke-linejoin", "round")
       .attr("stroke-width", 3)
       .attr("stroke", "white");

   // Transition nodes to their new position.
   const nodeUpdate = node.merge(nodeEnter).transition(transition)
       .attr("transform", d => `translate(${d.y},${d.x})`)
       .attr("fill-opacity", 1)
       .attr("stroke-opacity", 1);

   // Transition exiting nodes to the parent's new position.
   const nodeExit = node.exit().transition(transition).remove()
       .attr("transform", d => `translate(${source.y},${source.x})`)
       .attr("fill-opacity", 0)
       .attr("stroke-opacity", 0);

   // Update the links…
   const link = gLink.selectAll("path")
     .data(links, d => d.target.id);

   // Enter any new links at the parent's previous position.
   const linkEnter = link.enter().append("path")
       .attr("d", d => {
         const o = {x: source.x0, y: source.y0};
         return diagonal({source: o, target: o});
       });

   // Transition links to their new position.
   link.merge(linkEnter).transition(transition)
       .attr("d", diagonal);

   // Transition exiting nodes to the parent's new position.
   link.exit().transition(transition).remove()
       .attr("d", d => {
         const o = {x: source.x, y: source.y};
         return diagonal({source: o, target: o});
       });

   // Stash the old positions for transition.
   root.eachBefore(d => {
     d.x0 = d.x;
     d.y0 = d.y;
   });
 }

 update(root);

 return svg.node();
}


function displayStructure (){
  let allWindows = Object.create(rabbitHole);
  let currentWindow = Object.create(rabbitHole);
  let allTabs = Object.create(rabbitHole);

  loadCurrentWindow()
    .then( result => currentWindow.structure(result), //set data
           error => console.log("OOPS there was a data load error"))
    .then( result => staticChart(result, currWindowDiv))
    // .then( result => console.log(result))
    // .then( /*getStructure*/)
    // .then( /*getProvenance*/)

  loadAllWindows()
    .then( result => allWindows.structure(result), //set data
           error => console.log("OOPS there was a data load error"))
    .then( result => staticChart(result, allWindowDiv))
    // .then( result => console.log(result))
    // .then( /*getStructure*/)
    // .then( /*getProvenance*/)

  loadAllTabs()
      .then( result => allTabs.structure(result), //set data
             error => console.log("OOPS there was a data load error"))
      .then( result => staticChart(result, tabsDiv))
      // .then( result => console.log(result))
      // .then( /*getStructure*/)
      // .then( /*getProvenance*/)
}

document.addEventListener('DOMContentLoaded', displayStructure());
