var spotifySchema = [
  {
    name: "text",
    dataType: "STRING",
    semantics: {
      conceptType: "DIMENSION"
    }
  },
  {
    name: "popularity",
    dataType: "NUMBER",
    semantics: {
      conceptType: "METRIC"
    }
  }
];

function getAuthType() {
  var response = {
    type: "OAUTH2"
  };
  return response;
}
var getOAuthService = function() {
  var scriptProps = PropertiesService.getScriptProperties();
  return OAuth2.createService("Spotify")
    .setAuthorizationBaseUrl(
      "https://accounts.spotify.com/authorize?response_type=code"
    )
    .setTokenUrl("https://accounts.spotify.com/api/token")
    .setClientId(scriptProps.getProperty("OAUTH_CLIENT_ID"))
    .setClientSecret(scriptProps.getProperty("OAUTH_CLIENT_SECRET"))
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction("authCallback");
};
function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput("Success! You can close this tab.");
  } else {
    return HtmlService.createHtmlOutput("Denied. You can close this tab");
  }
}
function isAuthValid() {
  var service = getOAuthService();
  if (service == null) {
    return false;
  }
  return service.hasAccess();
}
function get3PAuthorizationUrls() {
  var service = getOAuthService();
  if (service == null) {
    return "";
  }
  return service.getAuthorizationUrl();
}
function resetAuth() {
  var service = getOAuthService();
  service.reset();
}
function getConfig(request) {
  var config = {
    configParams: [
      {
        type: "INFO",
        name: "Spotify search",
        text: "Enter the artist for all their Spotify rated popularity tracks"
      },
      {
        type: "TEXTINPUT",
        name: "artistName",
        displayName: "Search",
        helpText: "e.g. Coldplay",
        placeholder: "Search for an artist for all songs"
      }
    ]
  };
  return config;
}
function getSchema(request) {
  var reqSchema = {
    schema: spotifySchema
  };
  return reqSchema;
}
function getData(request) {
  // Create schema for requested fields
  var requestedSchema = request.fields.map(function(field) {
    for (var i = 0; i < spotifySchema.length; i++) {
      if (spotifySchema[i].name == field.name) {
        return spotifySchema[i];
      }
    }
  });

  // Fetch and parse data from API
  var url = [
    "https://api.spotify.com/v1/search?q=",
    request.configParams.artistName,
    "&type=track"
  ];

  var options = {
    headers: {
      Authorization: "Bearer " + getOAuthService().getAccessToken()
    }
  };
  var response = UrlFetchApp.fetch(url.join(""), options);
  var parsedResponse = JSON.parse(response).tracks.items;
  console.log(parsedResponse);

  // Transform parsed data and filter for requested fields
  var requestedData = parsedResponse.map(function(trackSearch) {
    var values = [];
    requestedSchema.forEach(function(field) {
      switch (field.name) {
        case "text":
          values.push(trackSearch.name);
          break;
        case "popularity":
          values.push(trackSearch.popularity);
          break;
        default:
          values.push("");
          break;
      }
    });
    return {
      values: values
    };
  });

  return {
    schema: requestedSchema,
    rows: requestedData
  };
}
