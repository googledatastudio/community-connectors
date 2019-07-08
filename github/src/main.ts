interface ConfigParams {
  organization: string;
  repository: string;
}

interface Variables {
  organization: string;
  repository: string;
  stars?: boolean;
  issues?: boolean;
  star_gazer_pointer?: string;
  issues_pointer?: string;
  pull_requests_pointer?: string;
  title?: boolean;
  url?: boolean;
  closed?: boolean;
  author?: boolean;
  number?: boolean;
  labels?: boolean;
  milestone?: boolean;
  locked?: boolean;
  comments?: boolean;
}

interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

interface IssueResult {
  totalCount: number;
  pageInfo: PageInfo;
  nodes: Array<{
    number?: number;
    title?: string;
    closed?: boolean;
    url?: string;
    author?: {
      login: string;
    };
    labels?: {
      nodes: Array<{name: string}>;
    };
    milestone?: {
      title: string;
    };
    locked?: boolean;
    comments?: {
      totalCount: number;
    };
  }>;
}
interface StarResult {
  totalCount: number;
  pageInfo: PageInfo;
  nodes: {
    createdAt: string;
  };
}

interface QueryResult {
  data: {
    organization: {
      repository: {
        issues?: IssueResult;
        pullRequests?: IssueResult;
        stargazers?: StarResult;
      };
    };
  };
}

type Group = 'stargazers' | 'issues';

var cc = DataStudioApp.createCommunityConnector();
var ISSUES = 'issues';
var STARS = 'stargazers';
var BASE_QUERY_STRING =
  '\
query (\
$organization: String!,\
$repository: String!,\
\
$stars: Boolean = false, \
$issues: Boolean = false, \
\
$star_gazer_pointer: String, \
$issues_pointer: String,\
$pull_requests_pointer: String,\
\
$title: Boolean = false, \
$url: Boolean = false, \
$closed: Boolean = false,\
$author: Boolean=false,\
$number: Boolean=false,\
$labels: Boolean=false,\
$milestone: Boolean=false,\
$locked: Boolean=false,\
$comments: Boolean=false\
) {  organization(login: $organization) {\
repository(name: $repository) {\
issues(first: 1, after: $issues_pointer) @include(if: $issues) {\
totalCount\
pageInfo {\
endCursor\
hasNextPage\
}\
nodes {\
number @include(if: $number)\
title @include(if: $title)\
closed @include(if: $closed)\
url @include(if: $url)\
author @include(if: $author) {\
login\
}\
labels(first: 100) @include(if: $labels) {\
nodes {\
name\
}\
}\
milestone @include(if: $milestone) {\
title\
}\
locked @include(if: $locked)\
comments @include(if: $comments) {\
totalCount\
}\
}\
}\
pullRequests(first: 1, after: $pull_requests_pointer) @include(if: $issues) {\
totalCount\
pageInfo {\
endCursor\
hasNextPage\
}\
nodes {\
number @include(if: $number)\
title @include(if: $title)\
closed @include(if: $closed)\
url @include(if: $url)\
author @include(if: $author) {\
login\
}\
labels(first: 100) @include(if: $labels) {\
nodes {\
name\
}\
}\
milestone @include(if: $milestone) {\
title\
}\
locked @include(if: $locked)\
comments @include(if: $comments) {\
totalCount\
}\
}\
}\
stargazers(first: 1, after: $star_gazer_pointer) @include(if: $stars) {\
totalCount\
pageInfo {\
endCursor\
hasNextPage\
}\
nodes {\
createdAt\
}\
}\
}\
}\
}\
';

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}
// https://developers.google.com/datastudio/connector/reference#getauthtype
function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.OAUTH2)
    .build();
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId('organization')
    .setName('Organization')
    .setHelpText(
      'The name of the organization (or user) that owns the repository.'
    )
    .setPlaceholder('googledatastudio')
    .setAllowOverride(true);

  config
    .newTextInput()
    .setId('repository')
    .setName('Repository')
    .setHelpText('The name of the repository.')
    .setPlaceholder('community-connectors')
    .setAllowOverride(true);

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  // Issues
  var defaultDimension = fields
    .newDimension()
    .setId('number')
    .setName('Number')
    .setDescription('The issue number.')
    .setGroup(ISSUES)
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setDescription('The title of the issue.')
    .setGroup(ISSUES)
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('open')
    .setName('Is Open')
    .setDescription('True if the issue is open, false otherwise.')
    .setGroup(ISSUES)
    .setType(types.BOOLEAN);

  fields
    .newDimension()
    .setId('url')
    .setName('Issue URL')
    .setDescription('The URL of the issue.')
    .setGroup(ISSUES)
    .setType(types.URL);

  fields
    .newDimension()
    .setId('reporter')
    .setName('Reporter')
    .setDescription('Issue reporter username.')
    .setGroup(ISSUES)
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('label')
    .setName('Label')
    .setDescription('Issue has this label.')
    .setGroup(ISSUES)
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('milestone')
    .setName('Milestone')
    .setDescription('Issue added to this milestone.')
    .setGroup(ISSUES)
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('locked')
    .setName('Is Locked')
    .setDescription('True if the issue is locked, false otherwise.')
    .setGroup(ISSUES)
    .setType(types.BOOLEAN);

  var defaultMetric = fields
    .newMetric()
    .setId('num_comments')
    .setName('Number of Comments')
    .setDescription('Number of commments on the issue.')
    .setGroup(ISSUES)
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('is_pull_request')
    .setName('Is Pull Request')
    .setDescription('True if this issue is a Pull Request, false otherwise.')
    .setGroup(ISSUES)
    .setType(types.BOOLEAN);

  fields
    .newDimension()
    .setId('created_at')
    .setName('Creation Time')
    .setDescription('The time this issue was created.')
    .setGroup(ISSUES)
    .setType(types.YEAR_MONTH_DAY_HOUR);

  fields
    .newDimension()
    .setId('closed_at')
    .setName('Close Time')
    .setDescription('The time this issue was closed.')
    .setGroup(ISSUES)
    .setType(types.YEAR_MONTH_DAY_HOUR);

  // Stars
  fields
    .newDimension()
    .setId('starred_at')
    .setName('Starred Date')
    .setDescription('The date the star was given.')
    .setGroup(STARS)
    .setType(types.YEAR_MONTH_DAY_HOUR);

  fields
    .newMetric()
    .setId('stars')
    .setName('Stars')
    .setDescription('The number of stars')
    .setGroup(STARS)
    .setType(types.NUMBER);

  fields.setDefaultDimension(defaultDimension.getId());
  fields.setDefaultMetric(defaultMetric.getId());

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  validateConfig(request.configParams);
  return {schema: getFields().build()};
}

function getGroup(requestedFields) {
  return requestedFields.asArray().reduce(function(group, field) {
    if (!group) {
      return field.getGroup();
    }
    if (group !== field.getGroup()) {
      cc.newUserError()
        .setText(
          'You can only choose fields in the same group. You chose fields from "' +
            group +
            '" and "' +
            field.getGroup() +
            '"'
        )
        .throwException();
    }
    return group;
  }, undefined);
}

function getVariables(
  group: Group,
  configParams: ConfigParams,
  // TODO - not sure what to do type-wise here.
  requestedFields: any
): Variables {
  var variables = configParams;
  variables[group] = true;
  return requestedFields
    .asArray()
    .reduce(function(variables: Variables, field) {
      variables[field.getId()] = true;
      return variables;
    }, variables);
}

// variables will include pagination.
function getPage(variables: Variables): QueryResult {
  var payload = {
    query: BASE_QUERY_STRING,
    variables: variables
  };
  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      Accept: 'application/vnd.github.v3.star+json',
      Authorization: 'token ' + getOAuthService().getAccessToken()
    }
  };
  return JSON.parse(
    UrlFetchApp.fetch('https://api.github.com/graphql', options)
  );
}

function graphqlFetch(variables: Variables): QueryResult[] {
  var hasNextPage = true;
  var maxPages = 10;
  var currentPage = 0;
  var data: QueryResult[] = [];
  while (hasNextPage && currentPage < maxPages) {
    currentPage++;
    var response = getPage(variables);

    var starData = response.data.organization.repository.stargazers;
    if (starData !== undefined) {
      hasNextPage = starData.pageInfo.hasNextPage;
      variables.star_gazer_pointer = starData.pageInfo.endCursor;
    }

    var issueData = response.data.organization.repository.issues;
    if (issueData !== undefined) {
      hasNextPage = issueData.pageInfo.hasNextPage;
      variables.issues_pointer = issueData.pageInfo.endCursor;
      if (variables.issues_pointer === null) {
        // Stop requesting issues once the pointer is explicitly null.
        variables.issues = false;
      }
    }

    var pullRequestData = response.data.organization.repository.pullRequests;
    if (pullRequestData !== undefined) {
      hasNextPage = pullRequestData.pageInfo.hasNextPage;
      variables.pull_requests_pointer = pullRequestData.pageInfo.endCursor;
      if (variables.issues_pointer === null) {
        variables.issues = false;
      }
    }
    data.push(response);
  }
  return data;
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var config = request.configParams;
  validateConfig(config);

  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  var group = getGroup(requestedFields);
  var variables = getVariables(group, request.configParams, requestedFields);
  var graphqlData = graphqlFetch(variables);
  switch (group) {
    case ISSUES: {
      // Parse the data as issues
    }
    case STARS: {
      // Parse the data as stars
    }
  }
  return;
}

function parseStarRow(requestedFields, star) {
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'stars':
        return 1;
      case 'starred_at':
        return formatDate(star.starred_at);
      default:
        return cc
          .newUserError()
          .setDebugText(
            'Field "' +
              requestedField.getId() +
              '" has not been accounted for in code yet.'
          )
          .setText('You cannot use ' + requestedField.getId() + ' yet.')
          .throwException();
    }
  });
  return {values: row};
}

function getDataStars(request, config, requestedFields) {
  var fetchOptions = {
    headers: {
      Accept: 'application/vnd.github.v3.star+json',
      Authorization: 'token ' + getOAuthService().getAccessToken()
    }
  };
  var rows = [];
  config.query = {
    per_page: 100
  };
  var url = getUrl(config);
  while (url) {
    var response = UrlFetchApp.fetch(url, fetchOptions);
    var parsedResponse = JSON.parse(response);
    parsedResponse.forEach(function(issue) {
      rows.push(parseStarRow(requestedFields, issue));
    });
    // do something with the response.
    url = getNextUrl(response);
  }

  var response = {
    schema: requestedFields.build(),
    rows: rows
  };
  return response;
}

function parseIssueRow(requestedFields, issue) {
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'open':
        return issue.state === 'open';
      case 'reporter':
        return issue.user.login;
      case 'num_comments':
        return issue.comments;
      case 'is_pull_request':
        return issue.pull_request !== undefined;
      case 'created_at':
        return formatDate(issue.created_at);
      case 'closed_at':
        return formatDate(issue.closed_at);
      case 'url':
        return issue.html_url;
      case 'number':
        return '' + issue.number;
      case 'locked':
        return issue.locked;
      case 'title':
        return issue.title;
      case 'label':
        return issue.label;
      case 'milestone':
        return issue.milestone;
      default:
        return cc
          .newUserError()
          .setDebugText(
            'Field "' +
              requestedField.getId() +
              '" has not been accounted for in code yet.'
          )
          .setText('You cannot use ' + requestedField.getId() + ' yet.')
          .throwException();
    }
  });
  return {values: row};
}

function getDataIssue(request, config, requestedFields) {
  var fetchOptions = {
    headers: {
      Accept: 'application/vnd.github.v3.full+json',
      Authorization: 'token ' + getOAuthService().getAccessToken()
    }
  };
  var rows = [];
  config.query = {state: 'all', per_page: 100};
  var url = getUrl(config);
  while (url) {
    var response = UrlFetchApp.fetch(url, fetchOptions);
    var parsedResponse = JSON.parse(response);
    parsedResponse.forEach(function(issue) {
      rows.push(parseIssueRow(requestedFields, issue));
    });
    // do something with the response.
    url = getNextUrl(response);
  }

  var response = {
    schema: requestedFields.build(),
    rows: rows
  };
  return response;
}

function getUrl(config) {
  var organization = config.organization;
  var repository = config.repository;
  var endpoint = config.endpoint;
  var query = config.query;

  var path = [organization, repository, endpoint]
    .map(encodeURIComponent)
    .join('/');

  return 'https://api.github.com/repos/' + path + encodeQuery(query);
}

function validateConfig(config) {
  var config = config || {};
  if (!config.organization) {
    cc.newUserError()
      .setText('Organization cannot be left blank.')
      .throwException();
  }
  if (!config.repository) {
    cc.newUserError()
      .setText('Repository cannot be left blank.')
      .throwException();
  }
  return true;
}

function getNextUrl(response) {
  var headers = response.getAllHeaders();
  var linkHeaders = headers['Link'] || [];
  if (typeof linkHeaders === 'string') {
    linkHeaders = [linkHeaders];
  }
  for (var j = 0; j < linkHeaders.length; j++) {
    var link = linkHeaders[j];
    if (!link) continue;
    var match = link.match(NEXT_URL_PATTERN);
    if (!match) continue;
    return match[1];
  }
  return null;
}

function encodeQuery(queryParams) {
  if (!queryParams) return '';

  var query = Object.keys(queryParams)
    .map(function(key) {
      return (
        encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])
      );
    })
    .join('&');

  return query === '' ? '' : '?' + query;
}

function formatDate(date) {
  return !date
    ? null
    : date instanceof Date
    ? formatDate(date.toISOString())
    : date.slice(0, 4) +
      date.slice(5, 7) +
      date.slice(8, 10) +
      date.slice(11, 13);
}
