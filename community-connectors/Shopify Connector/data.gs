function isAdminUser(){return true;}

function unull(value, replacement){return (value == null) ? replacement : value}
function responseToRows(requestedFields, response) {
  // Transform parsed data and filter for requested fields
  return response.map(function(Data) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        // SHARED CASES
         
        case 'created_at':
          return row.push(Data.created_at.replace(/-/g, '').replace(/:/g, '').replace(/T/g, '').slice(0,14));
        
        case 'closed_at':
          return row.push(unull(Data.closed_at,"Non closed").replace(/-/g, '').replace(/:/g, '').replace(/T/g, '').slice(0,14));
        case 'cancelled_at':
          return row.push(unull(Data.cancelled_at,'Non cancelled').replace(/-/g, '').replace(/:/g, '').replace(/T/g, '').slice(0,14));
        case 'total_line_items_price':
          return row.push(Data.total_line_items_price); 
        case 'total_weight':
          return row.push(Data.total_weight);  
        case 'financial_status':
          return row.push(Data.financial_status);
        case 'location_id':
          return row.push(Data.location_id);
        case 'source_name':
          return row.push(Data.source_name);
        case 'total_discounts':
          return row.push(Data.total_discounts);
          
        case 'order_country_code':
          try{
          return row.push(Data.shipping_address.country);
          }catch(Exception){return row.push("Undefined");}
        case 'order_city':
        try{
          return row.push(Data.shipping_address.city);
          }catch(Exception){return row.push("Undefined");}
        case 'order_province_code':
        try{
          return row.push(Data.shipping_address.province);
          }catch(Exception){return row.push("Undefined");}
          
        case 'total_tax':
          return row.push(Data.total_tax);
        case 'buyer_accepts_marketing':
          return row.push(Data.buyer_accepts_marketing);
        case 'fulfillment_status':
          return row.push(unull(Data.fulfillment_status,"Unfulfilled"));
        case 'landing_site':
          return row.push(unull(Data.landing_site,"Undefined"));
        case 'processing_method':
          return row.push(unull(Data.processing_method,"Undefined"));
        
        
          case 'customer_created_at':
            try{
              return row.push(unull(Data.customer.created_at,"undefined").replace(/-/g, '').replace(/:/g, '').replace(/T/g, '').slice(0,14));
            }catch(Exception){return row.push("Undefined");}
          case 'accepts_marketing':
          try{
            if(Data.customer.accepts_marketing==true){return row.push("Accept marketing");}
            if(Data.customer.accepts_marketing==false){return row.push("Don't accept marketing");}
            return row.push(unull(Data.customer.accepts_marketing,"Undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'state':
          try{
            return row.push(unull(Data.customer.state,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'total_spent':
          try{
            return row.push(unull(Data.customer.total_spent,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'verified_email':
          try{
            return row.push(unull(Data.customer.verified_email,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'orders_count':
          try{
            return row.push(unull(Data.customer.orders_count,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'customer_currency':
          try{
            return row.push(unull(Data.customer.currency,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'customer_id':
          try{
            return row.push(unull(Data.customer.email,"undefined"));
            }catch(Exception){return row.push("Undefined");}
          case 'customer_locale':
          try{
            return row.push(Data.customer_locale);
          }catch(Exception){return row.push("Undefined");}
          
        case 'presentment_currency':
          return row.push(Data.presentment_currency);
        case 'referring_site':
          if(Data.referring_site==""){return row.push('Undefined');}
          return row.push(unull(Data.referring_site,'Undefined'));
        case 'total_tip_received':
          return row.push(Data.total_tip_received);
          
        case 'taxes_included':
          return row.push(Data.taxes_included);
        case 'total_price':
          return row.push(Data.total_price);
        case 'items_count':
          return row.push(Data.line_items.length);
        case 'cancel_reason':
          return row.push(Data.cancel_reason);
        case 'discounts_count':
          if(Data.discount_applications.length==null){return row.push(0);}
          return row.push(Data.discount_applications.length);
        default:
          return row.push('');
      }
    });
    return { values: row };
  });
}

function getData(request) {
  
  try{
    var requestedFields = getFields(request).forIds(
      request.fields.map(function(field) {
        return field.name;
      })
    );
    // Fetch and parse data from API
    var created_min = request.dateRange.startDate;
    var created_max = request.dateRange.endDate;
    var response = pull_orders(created_min, created_max, null);
    var parsedResponse = JSON.parse(response.getContentText())["orders"];
    var rows = responseToRows(requestedFields, parsedResponse);
    var nxt = next_link(response, true);
    while(nxt!=null){
      var response = pull_orders(null, null, nxt);
      var parsedResponse1 = JSON.parse(response.getContentText())["orders"];
      var nwrows = responseToRows(requestedFields, parsedResponse1);
      rows = rows.concat(nwrows);
      var nxt = next_link(response, false);
      if(nxt==null){console.log("out of nxts");}else{console.log("there's another!!");}
    }
    
    return {
      schema: requestedFields.build(),
      rows: rows
    };
    }catch(e){
      DataStudioApp.createCommunityConnector()
      .newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e +'\n contact: support@sysharmony.com')
      .setText('There was an error communicating with the service. Try again later, or file an issue if this error persists.\n contact: support@sysharmony.com')
      .throwException();
      console.log("Error while pulling data: "+e);
    }
}