/*
This connector can connect to your Senuto DataStudio datas,
and use the datas from SENUTO API in Data Studio.
*/

var connector = connector || {};

/**
 * An enum that defines the authentication types that can be set for a connector.
 * $see https://developers.google.com/apps-script/reference/data-studio/auth-type
 */
function getAuthType() {
  var response = { type: "NONE" }; // OAUTH2, USER_PASS, KEY, USER_TOKEN
  return response;
}

/**
 * Builds the Community Connector config.
 * @returns {Object} config -  The Community Connector config.
 * @see https://developers.google.com/apps-script/reference/data-studio/config
 */
function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId("hash")
    .setName("Security ID")
    .setHelpText("Enter the Security ID to get history.")
    .setPlaceholder("securityidsecurityidsecurityidsecurityid");

  config
    .newTextInput()
    .setId("domain")
    .setName("Domain")
    .setHelpText("Enter the Domain to get history.")
    .setPlaceholder("senuto.com");

  config
    .newSelectSingle()
    .setId("fetchMode")
    .setName("fetchMode")
    .setHelpText("Select match domain")
    .setAllowOverride(true)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("domain.com/*")
        .setValue("topLevelDomain")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("*.domain.com/*")
        .setValue("subdomain")
    );

  config
    .newSelectSingle()
    .setId("typeId")
    .setName("Data source type")
    .setHelpText("Select data source Type")
    .setAllowOverride(true)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - Visibility Top3, Top10, Top50")
        .setValue("aw_visibility")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - Statistics")
        .setValue("aw_statistics")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - TOP 100 Positions")
        .setValue("aw_important")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - TOP 100 Increases")
        .setValue("aw_increased")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - TOP 100 Decreases")
        .setValue("aw_decreased")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Visibility Analysis - TOP Competitors")
        .setValue("aw_competitors")
    );

  return config.build();
}

var fieldsMetric = [
  "top3_history",
  "top10_history",
  "top50_history",
  "top3_history_weekly",
  "top10_history_weekly",
  "top50_history_weekly",
  "keyword_brand",
  "keyword_searches",
  "keyword_visibility",
  "keyword_visibility_yesterday",
  "keyword_visibility_prev_week",
  "keyword_difficulty",
  "keyword_position",
  "keyword_position_yesterday",
  "keyword_position_prev_week",
  "keyword_results_count",
  "keyword_words_count",
  "keyword_trend_1",
  "keyword_trend_2",
  "keyword_trend_3",
  "keyword_trend_4",
  "keyword_trend_5",
  "keyword_trend_6",
  "keyword_trend_7",
  "keyword_trend_8",
  "keyword_trend_9",
  "keyword_trend_10",
  "keyword_trend_11",
  "keyword_trend_12",
  "statistics_top3",
  "statistics_top3_diff",
  "statistics_top3_old",
  "statistics_top10",
  "statistics_top10_diff",
  "statistics_top10_old",
  "statistics_top50",
  "statistics_top50_diff",
  "statistics_top50_old",
  "statistics_category_rank",
  "statistics_visibility",
  "statistics_visibility_no_brand",
  "statistics_ads_equivalent",
  "statistics_domain_rank",
  "competitors_top3",
  "competitors_top3_diff",
  "competitors_top3_old",
  "competitors_top10",
  "competitors_top10_diff",
  "competitors_top10_old",
  "competitors_top50",
  "competitors_top50_diff",
  "competitors_top50_old",
  "competitors_visibility",
  "competitors_ads_equivalent",
  "competitors_domain_rank"
];

var fieldsDimension = [
  "keyword_name",
  "keyword_url",
  "keyword_main_domain",
  "statistics_category_name",
  "competitors_main_domain"
];

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId("time")
    .setName("time")
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId("week")
    .setName("week")
    .setType(types.TEXT);

  fieldsDimension.forEach(function(item, index, array) {
    fields
      .newDimension()
      .setId(item)
      .setName(item)
      .setType(types.TEXT);
  });

  fieldsMetric.forEach(function(item, index, array) {
    fields
      .newMetric()
      .setId(item)
      .setName(item)
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);
  });

  return fields;
}

/**
 * Builds the Community Connector schema.
 * @param {object} request The request.
 * @return {object} The schema.
 */
function getSchema(request) {
  return { schema: getFields().build() };
}
/**
 * Gets the data for the community connector
 * @param {object} request The request.
 * @return {object} The data.
 */
function getData(request) {
  // Create schema for requested fields
  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  // Fetch and parse data from API
  var url = [
    "https://api.senuto.com/api/data_studio/visibility_analysis/domain_positions/getPositionsHistoryChartData2?",
    ,
    "domain=",
    request.configParams.domain,
    "&date_min=2016-03-01",
    "&hash=",
    request.configParams.hash,
    "&fetch_mode=",
    request.configParams.fetchMode,
    "&type_id=",
    request.configParams.typeId
  ];

  var response = UrlFetchApp.fetch(url.join(""));
  var parsedResponse = JSON.parse(response).data;

  // Transform parsed data and filter for requested fields
  var requestedData = parsedResponse.map(function(schemaData) {
    var values = [];
    var valuesPush = fieldsMetric.concat(fieldsDimension);

    requestedFields.asArray().forEach(function(field) {
      if (field.getId() == "time" || field.getId() == "week") {
        values.push(
          Utilities.formatDate(
            new Date(schemaData[field.getId()] * 1000),
            "Europe/Warsaw",
            "yyyyMMdd"
          ).toString()
        );
      } else if (valuesPush.indexOf(field.getId()) > -1) {
        values.push(schemaData[field.getId()]);
      } else {
        values.push("");
      }
    });

    return { values: values };
  });

  return {
    schema: requestedFields.build(),
    rows: requestedData
  };
}
