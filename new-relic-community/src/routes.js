
var routes = {
  "deployments": "applications/:application_id/deployments.json", 
  "incidents": "alerts_incidents.json",
  "violations": "alerts_violations.json"
};

function getRoute(endPoint, params){
  var final_route = routes[endPoint]
  params.forEach(function addParams(param, index) {
    final_route = final_route.replace(/:\w*\//,(param+"/"))
  });
  return final_route;
}

