function check_connection(url,token){
  try{
    console.log(url);
    var shop_url = "https://"+url;
    var token = token;
    var vheaders = make_vheaders(token);
    var options = make_options(vheaders);
    var con_url = shop_url+"/admin/api/2020-01/orders.json?limit=250";
    var response = UrlFetchApp.fetch(con_url,options);
    if(response.getResponseCode()==200){return true;}else{return false;}
    }catch(e){
      console.log(e);
      return false;
    }
}
//pulling orders between start date and end date
function pull_orders(start, end, nxt){
  var userProperties = PropertiesService.getUserProperties();
  var shop_url = "https://"+userProperties.getProperty("dscc.username");
  var token = userProperties.getProperty('dscc.password');
  var vheaders = make_vheaders(token);
  var options = make_options(vheaders);
  console.log("new version 2");
  if(nxt==null){
    var con_url = shop_url+"/admin/api/2020-01/orders.json?limit=250&created_at_min="+start+"T00:00:00-00:00"+"&created_at_max="+end+"T00:00:00-00:00";
    var response = UrlFetchApp.fetch(con_url,options);
    if(response.getResponseCode()==429){console.log("limit hit, sleeping for 5 secs");
      Utilities.sleep(5000);
      response = UrlFetchApp.fetch(con_url,options);
      Utilities.sleep(1500);
      }
    if(check_limit(response)){console.log("limit reached");Utilities.sleep(1000);}
    return response;
    }
  else{
    var response = UrlFetchApp.fetch(nxt,options);
    if(response.getResponseCode()==429){console.log("limit hit, sleeping for 5 secs");
      Utilities.sleep(5000);
      response = UrlFetchApp.fetch(nxt,options);
      Utilities.sleep(1500);
      }
    if(check_limit(response)){console.log("limit reached");Utilities.sleep(1000);}
    return response;
  }
}
