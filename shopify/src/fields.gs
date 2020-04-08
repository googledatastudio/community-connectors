function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  console.log("tst2");
  console.log(request);
  
    fields.newDimension()
        .setId('order_country_code')
        .setName("country of the shipping address")
        .setDescription('country of the shipping address')
        .setType(types.COUNTRY);
    fields.newDimension()
        .setId('order_city')
        .setName("The city, town, or village")
        .setDescription('The city, town, or village of the shipping address')
        .setType(types.COUNTRY);
    fields.newDimension()
        .setId('order_province_code')
        .setName("region of the shipping address")
        .setDescription('region of the shipping address')
        .setType(types.REGION);
    fields.newDimension()
        .setId('buyer_accepts_marketing')
        .setName("Buyer accepts marketing")
        .setDescription('Whether the customer consented to receive email updates from the shop.')
        .setType(types.BOOLEAN)
        .setGroup('Customer');
    fields.newDimension()
        .setId('created_at')
        .setName('Order Creation Date')
        .setDescription('when the order was created in Shopify.')
        .setType(types.YEAR_MONTH_DAY_HOUR)
        .setGroup('Order');
  fields.newDimension()
        .setId('cancelled_at')
        .setName('Order Cancelled date')
        .setDescription('when the order was cancelled in Shopify.')
        .setType(types.YEAR_MONTH_DAY_HOUR)
        .setGroup('Order');
    fields.newDimension()
        .setId('closed_at')
        .setName('order Date closed')
        .setDescription('when the order was closed in Shopify.')
        .setType(types.YEAR_MONTH_DAY_HOUR)
        .setGroup('Order');
   fields.newDimension()
        .setId('customer_locale')
        .setName('customer locale')
        .setDescription('The two or three-letter language code, optionally followed by a region modifier.')
        .setType(types.TEXT)
        .setGroup('Customer');
   fields.newDimension()
        .setId('financial_status')
        .setName('Order Financial status')
        .setDescription('The status of payments associated with the order.')
        .setType(types.TEXT);
   fields.newDimension()
        .setId('fulfillment_status')
        .setName('Order Fulfillment status')
        .setDescription("The order's status in terms of fulfilled line items.")
        .setType(types.TEXT);
   fields.newDimension()
        .setId('landing_site')
        .setName('Landing site')
        .setDescription('The URL for the page where the buyer landed when they entered the shop.')
        .setType(types.TEXT);
   fields.newDimension()
        .setId('processing_method')
        .setName('Processing method')
        .setDescription('How the payment was processed.')
        .setType(types.TEXT);
   fields.newDimension()
        .setId('location_id')
        .setName('Order Location id')
        .setDescription('The ID of the physical location where the order was processed.')
        .setType(types.TEXT);
  fields.newDimension()
        .setId('customer_id')
        .setName('Customer email')
        .setDescription('The email of the customer who made the order.')
        .setType(types.TEXT);
        
   fields.newDimension()
        .setId('source_name')
        .setName('Order Source name')
        .setDescription('Where the order originated (web, pos, IOS, Android, shopify_draft_order)')
        .setType(types.TEXT);
   fields.newDimension()
        .setId('customer_currency')
        .setName('Customer currency')
        .setDescription('Customer currency')
        .setType(types.TEXT)
        .setGroup('Customer');
        
        
   fields.newMetric()
        .setId('total_line_items_price')
        .setName('Total line items price')
        .setDescription('The sum of all line item prices in the shop currency.')
        .setType(types.NUMBER)
        .setGroup('Money');
        
   fields.newMetric()
        .setId('total_discounts')
        .setName('Order Total discounts')
        .setDescription('The total discounts applied to the price of the order in the shop currency.')
        .setType(types.NUMBER)
        .setGroup('Money');
        
   fields.newMetric()
        .setId('total_tax')
        .setName('Order Total tax')
        .setDescription('The sum of all the taxes applied to the order in th shop currency.')
        .setType(types.NUMBER)
        .setGroup('Money');
        
  fields.newMetric()
        .setId('total_price')
        .setName('Cash Flow')
        .setDescription('The sum of all line item prices, discounts, shipping, taxes, and tips in the shop currency.')
        .setType(types.NUMBER)
        .setGroup('Money');
        
   fields.newMetric()
        .setId('total_weight')
        .setName('total weight')
        .setDescription('The sum of all line item weights in grams.')
        .setType(types.NUMBER);
   fields.newDimension()
        .setId('accepts_marketing')
        .setName('Csutomer Accepts marketing')
        .setDescription('Whether the customer has consented to receive marketing material via email.')
        .setType(types.TEXT)
        .setGroup('Customer');
    fields.newDimension()
      .setId('customer_created_at')
      .setName('Customer Creation Date')
      .setDescription('The date when the customer was created')
      .setType(types.YEAR_MONTH_DAY_HOUR)
      .setGroup('Customer');
    fields.newMetric()
        .setId('orders_count')
        .setName('customer orders count')
        .setDescription('The number of orders associated with this customer.')
        .setType(types.NUMBER)
        .setGroup('Customer');
    fields.newDimension()
        .setId('state')
        .setName('state')
        .setDescription("The state of the customer's account with a shop.")
        .setType(types.TEXT)
        .setGroup('Customer');
    fields.newMetric()
        .setId('total_spent')
        .setName('customer total spent')
        .setDescription('The total amount of money that the customer has spent across their order history.')
        .setType(types.NUMBER)
        .setGroup('Customer');
        
        
   fields.newDimension()
        .setId('taxes_included')
        .setName('taxes included')
        .setDescription('Whether taxes are included in the order subtotal.')
        .setType(types.BOOLEAN);     
        
    fields.newDimension()
        .setId('verified_email')
        .setName('verified email')
        .setDescription('Whether the customer has verified their email address.')
        .setType(types.BOOLEAN)
        .setGroup('Customer');
    fields.newDimension()
        .setId('presentment_currency')
        .setName('presentment currency')
        .setDescription("The presentment currency that was used to display prices to the customer.")
        .setType(types.TEXT)
        .setGroup('Customer');
    fields.newDimension()
        .setId('referring_site')
        .setName('referring site')
        .setDescription("The website where the customer clicked a link to the shop.")
        .setType(types.TEXT);
    fields.newDimension()
        .setId('total_tip_received')
        .setName('order total tip received')
        .setDescription("The sum of all the tips in the order in the shop currency.")
        .setType(types.TEXT);
    fields.newDimension()
        .setId('cancel_reason')
        .setName('order cancel reason')
        .setDescription("The reason why the order was canceled.")
        .setType(types.TEXT);
   fields.newMetric()
        .setId('items_count')
        .setName('Items in order')
        .setDescription("Count of items sold in the order.")
        .setType(types.NUMBER);
  fields.newMetric()
        .setId('discounts_count')
        .setName('Discountss in order')
        .setDescription("Count of discounts in the order.")
        .setType(types.NUMBER);
        
    fields.newMetric()
      .setId('TotalIncome')
      .setName('Total Income')
      .setType(types.NUMBER)
      .setGroup('Money')
      .setFormula('sum($total_price)');
   fields.newMetric()
      .setId('AverageOrderValue')
      .setName('Average Order Value')
      .setType(types.NUMBER)
      .setGroup('Money')
      .setFormula('avg($total_price)');
    fields.newMetric()
      .setId('AverageItemsPerOrder')
      .setName('Average Items Per Order')
      .setType(types.NUMBER)
      .setGroup('Money')
      .setFormula('avg($items_count)');
    fields.newMetric()
      .setId('AverageSpendingPerCustomer')
      .setName('Average Spending Per Customer')
      .setType(types.NUMBER)
      .setGroup('Money')
      .setFormula('SUM($total_price)/$CustomerCount');
    fields.newMetric()
      .setId('AverageOrdersPerCustomer')
      .setName('Average Orders Per Customer')
      .setType(types.NUMBER)
      .setGroup('Money')
      .setFormula('$OrdersCount/$CustomerCount');
    fields.newMetric()
      .setId('OrdersCount')
      .setName('Total number of orders')
      .setType(types.NUMBER)
      .setGroup('customer')
      .setFormula('COUNT($customer_id)');
    fields.newMetric()
      .setId('CustomerCount')
      .setName('Total number of customers who ordered')
      .setType(types.NUMBER)
      .setGroup('customer')
      .setFormula('COUNT_DISTINCT($customer_id)');
    fields.newMetric()
      .setId('CustomerCountM')
      .setName('Total number of customers who ordered more than once')
      .setType(types.NUMBER)
      .setGroup('customer')
      .setFormula('COUNT($customer_id)-$CustomerCount');
    fields.newMetric()
      .setId('TotalDiscountsVal')
      .setName('Total discounts value')
      .setType(types.NUMBER)
      .setGroup('customer')
      .setFormula('SUM($total_discounts)');
      
  return fields;
}

function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}
