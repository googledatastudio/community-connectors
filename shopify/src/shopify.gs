function make_vheaders(key){
  var vheaders = {
  "X-Shopify-Access-Token" : key
  }
  return vheaders;
}

function make_options(vheaders){
  var options = {
  'muteHttpExceptions': true,
  'method' : 'get',
  'contentType': 'application/json',
   headers : vheaders,
  };
  return options
}

function next_link(response, first){
  var r_headers = response.getHeaders();
  if(!("Link" in r_headers)){
    return null;
  }
  if(first==true){
    var splitted_link = []; splitted_link = r_headers['Link'].split(';');  
    var nxtlink = splitted_link[0];
    var co = nxtlink.slice(1,nxtlink.length-1);
    return co;
   }else{
      var splitted_link = []; splitted_link = r_headers['Link'].split(',');
      if(splitted_link.length<2){Logger.log("Returning null");return null;};
      splitted_link = splitted_link[1].split(';');
      var nxtlnk = splitted_link[0];
      var nxtlnk = nxtlnk.slice(2,nxtlnk.length-1);
      return nxtlnk;
    }
}

function check_limit(response){
  var limit = response.getHeaders();
  limit = limit["http_x_shopify_shop_api_call_limit"];
  console.log("limit is");
  console.log(limit);
  var splitted = limit.split("/");
  var val = parseFloat(splitted[0])/parseFloat(splitted[1]);
  console.log(val);
  if(val>0.7){return true;}
  return false;
}
