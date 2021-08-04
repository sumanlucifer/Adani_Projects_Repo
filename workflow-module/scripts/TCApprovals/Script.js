
// read from existing workflow context 
var oReceivedContext = $.context.aBOQItems; 
var aReceivedBOQItems = oReceivedContext.d.results;

// read contextual information
var taskDefinitionId = $.info.taskDefinitionId;


var a = [{
    "firstName": "shravan",
    "lastName":"Hulekal"
},{
    "firstName": "Venkatesh",
    "lastName":"Hulekal"
}];

$.context.collection=a;