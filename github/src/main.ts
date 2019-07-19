namespace Connector {
  interface GHConfigParams {
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
    reporter?: boolean;
    number?: boolean;
    labels?: boolean;
    milestone?: boolean;
    locked?: boolean;
    num_comments?: boolean;
    created_at?: boolean;
    closed_at?: boolean;
  }

  interface PageInfo {
    endCursor?: string;
    hasNextPage: boolean;
  }

  interface IssueResult {
    totalCount: number;
    pageInfo: PageInfo;
    nodes: Array<{
      is_pull_request?: boolean;
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
      createdAt?: string;
      closedAt?: string;
    }>;
  }
  interface StarResult {
    totalCount: number;
    pageInfo: PageInfo;
    edges: Array<{
      starredAt: string;
    }>;
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
  var BASE_QUERY_STRING = `
query (
 $organization: String!,
 $repository: String!,
 $stars: Boolean = false,
 $issues: Boolean = false,
 $star_gazer_pointer: String,
 $issues_pointer: String,
 $pull_requests_pointer: String,
 $title: Boolean = false,
 $url: Boolean = false,
 $closed: Boolean = false,
 $reporter: Boolean = false,
 $number: Boolean = false,
 $labels: Boolean = false,
 $milestone: Boolean = false,
 $locked: Boolean = false,
 $num_comments: Boolean = false,
 $created_at: Boolean = false,
 $closed_at: Boolean = false
) {
  organization(login: $organization) {
    repository(name: $repository) {
      issues(first: 100, after: $issues_pointer) @include(if: $issues) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          number @include(if: $number)
          title @include(if: $title)
          closed @include(if: $closed)
          url @include(if: $url)
          createdAt @include(if: $created_at)
          closedAt @include(if: $closed_at)
          author @include(if: $reporter) {
            login
          }
          labels(first: 100) @include(if: $labels) {
            nodes {
              name
            }
          }
          milestone @include(if: $milestone) {
            title
          }
          locked @include(if: $locked)
          comments @include(if: $num_comments) {
            totalCount
          }
        }
      }
      pullRequests(first: 100, after: $pull_requests_pointer) @include(if: $issues) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          number @include(if: $number)
          title @include(if: $title)
          closed @include(if: $closed)
          url @include(if: $url)
          createdAt @include(if: $created_at)
          closedAt @include(if: $closed_at)
author @include(if: $reporter) {
login
}
          labels(first: 100) @include(if: $labels) {
            nodes {
              name
            }
          }
          milestone @include(if: $milestone) {
            title
          }
          locked @include(if: $locked)
          comments @include(if: $num_comments) {
            totalCount
          }
        }
      }
      stargazers(first: 100, after: $star_gazer_pointer) @include(if: $stars) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          starredAt
        }
      }
    }
  }
}
`;

  // https://developers.google.com/datastudio/connector/reference#isadminuser
  export function isAdminUser() {
    return false;
  }
  // https://developers.google.com/datastudio/connector/reference#getauthtype
  export function getAuthType() {
    var AuthTypes = cc.AuthType;
    return cc
      .newAuthTypeResponse()
      .setAuthType(AuthTypes.OAUTH2)
      .build();
  }

  // https://developers.google.com/datastudio/connector/reference#getconfig
  export const getConfig: GetConfig = (request) => {
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
  };

  export const getFields: GetFields = () => {
    var fields = cc.getFields();
    var types = cc.FieldType;

    // cc.getFields() returns a Singleton, simply return it since this has
    // already run.
    if (fields.getFieldById('number') !== null) {
      return fields;
    }

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
      .setType(types.YEAR_MONTH_DAY);

    // Stars
    fields
      .newDimension()
      .setId('starred_at')
      .setName('Starred Date')
      .setDescription('The date the star was given.')
      .setGroup(STARS)
      .setType(types.YEAR_MONTH_DAY);

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
  };

  // https://developers.google.com/datastudio/connector/reference#getschema
  export const getSchema: GetSchema<GHConfigParams> = (request) => {
    Connector.validateConfig(request.configParams);
    return {schema: Connector.getFields().build()};
  };

  export const getGroup = (requestedFields: Fields): Group => {
    let group = undefined;
    for (const field of requestedFields.asArray()) {
      if (!group) {
        group = field.getGroup();
      } else if (group !== field.getGroup()) {
        cc.newUserError()
          .setText(
            `You can only choose fields in the same group. You chose fields from "${group}" and "${field.getGroup()}"`
          )
          .throwException();
      }
    }
    if (group === 'stargazers' || group === 'issues') {
      return group;
    } else {
      cc.newUserError()
        .setText(`Group: ${group} is not supported`)
        .throwException();
    }
  };

  export const getVariables = (
    group: Group,
    configParams: GHConfigParams,
    requestedFields: Fields
  ): Variables => {
    var variables = configParams;
    variables[group] = true;
    for (const field of requestedFields.asArray()) {
      variables[field.getId()] = true;
    }
    return variables;
  };

  // variables will include pagination.
  export const getPage = (variables: Variables): QueryResult => {
    var payload = {
      query: BASE_QUERY_STRING,
      variables: variables
    };
    var options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        Accept: 'application/vnd.github.v3.star+json',
        Authorization: 'token ' + getOAuthService().getAccessToken()
      }
    };
    return JSON.parse(
      UrlFetchApp.fetch(
        'https://api.github.com/graphql',
        options
      ).getContentText()
    );
  };

  export const graphqlFetch = (variables: Variables): QueryResult[] => {
    var hasNextPage = true;
    var maxPages = 7;
    var currentPage = 0;
    var data: QueryResult[] = [];
    while (hasNextPage && currentPage < maxPages) {
      currentPage++;
      var response = Connector.getPage(variables);

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
        // Manually add this this is a pull request.
        response.data.organization.repository.pullRequests.nodes.forEach(
          (pr) => {
            pr.is_pull_request = true;
          }
        );
        hasNextPage = pullRequestData.pageInfo.hasNextPage;
        variables.pull_requests_pointer = pullRequestData.pageInfo.endCursor;
        if (variables.issues_pointer === null) {
          variables.issues = false;
        }
      }
      data.push(response);
    }
    return data;
  };

  export const issueResultsToGetDataRows = (
    issueResults: IssueResult[],
    requestedFields: Fields
  ): GetDataRows => {
    let rows: GetDataRows = [];
    for (const issueResult of issueResults) {
      if (issueResult.nodes === undefined) {
        continue;
      }
      rows = rows.concat(
        issueResult.nodes.map((issue) => {
          var row: GetDataRowValue[] = requestedFields
            .asArray()
            .map((requestedField) => {
              switch (requestedField.getId()) {
                case 'open':
                  return !issue.closed;
                case 'reporter':
                  return issue.author.login;
                case 'num_comments':
                  return issue.comments.totalCount;
                case 'is_pull_request':
                  return issue.is_pull_request !== undefined;
                case 'created_at':
                  return Connector.formatDate(issue.createdAt);
                case 'closed_at':
                  return Connector.formatDate(issue.closedAt);
                case 'url':
                  return issue.url;
                case 'number':
                  return '' + issue.number;
                case 'locked':
                  return issue.locked;
                case 'title':
                  return issue.title;
                case 'label':
                  return issue.labels.nodes
                    .map((label) => label.name)
                    .join(', ');
                case 'milestone':
                  return issue.milestone.title;
                default:
                  cc.newUserError()
                    .setDebugText(
                      'Field "' +
                        requestedField.getId() +
                        '" has not been accounted for in code yet.'
                    )
                    .setText(
                      'You cannot use ' + requestedField.getId() + ' yet.'
                    )
                    .throwException();
                  return '';
              }
            });
          const result: GetDataRow = {values: row};
          return result;
        })
      );
    }
    return rows;
  };

  export const starResultsToGetDataRows = (
    starResults: StarResult[],
    requestedFields: Fields
  ): GetDataRows => {
    let rows: GetDataRows = [];
    for (const starResult of starResults) {
      rows = rows.concat(
        starResult.edges.map((stars) => {
          var row = requestedFields.asArray().map((requestedField) => {
            switch (requestedField.getId()) {
              case 'stars':
                return 1;
              case 'starred_at':
                return Connector.formatDate(stars.starredAt);
              default:
                return null;
            }
          });
          const result: GetDataRow = {values: row};
          return result;
        })
      );
    }
    return rows;
  };

  export const toGetDataRows = (
    queryResults: QueryResult[],
    requestedFields: Fields
  ): GetDataRows => {
    if (queryResults.length === 0) {
      return [];
    }
    if (queryResults[0].data.organization.repository.stargazers !== undefined) {
      let starResults: StarResult[] = [];
      for (const queryResult of queryResults) {
        const stargazers = queryResult.data.organization.repository.stargazers;
        if (stargazers) {
          starResults = starResults.concat(stargazers);
        }
      }
      return Connector.starResultsToGetDataRows(starResults, requestedFields);
    }
    if (
      queryResults[0].data.organization.repository.issues !== undefined ||
      queryResults[0].data.organization.repository.pullRequests !== undefined
    ) {
      let issueResults: IssueResult[] = [];
      for (const queryResult of queryResults) {
        const issueResult = queryResult.data.organization.repository.issues;
        if (issueResult !== undefined && issueResult !== null) {
          issueResults = issueResults.concat([issueResult]);
        }
        const pullRequest =
          queryResult.data.organization.repository.pullRequests;
        if (pullRequest !== undefined && pullRequest !== null) {
          issueResults = issueResults.concat([pullRequest]);
        }
      }
      return Connector.issueResultsToGetDataRows(issueResults, requestedFields);
    }
    return [];
  };

  // https://developers.google.com/datastudio/connector/reference#getdata
  export const getData: GetData<GHConfigParams> = (request) => {
    var config = request.configParams;
    Connector.validateConfig(config);

    var requestedFields: Fields = Connector.getFields().forIds(
      request.fields.map(function(field) {
        return field.name;
      })
    );

    var group = Connector.getGroup(requestedFields);
    var variables = Connector.getVariables(
      group,
      request.configParams,
      requestedFields
    );
    var queryResults = Connector.graphqlFetch(variables);
    var parsed = Connector.toGetDataRows(queryResults, requestedFields);
    return {
      schema: requestedFields.build(),
      rows: parsed
    };
  };

  export const validateConfig = (config: GHConfigParams): boolean => {
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
  };

  export const formatDate = (date: string): string => {
    return (
      // YYYY
      date.slice(0, 4) +
      // MM
      date.slice(5, 7) +
      // DD
      date.slice(8, 10)
    );
  };
}

const getConfig = Connector.getConfig;
const getData = Connector.getData;
const getSchema = Connector.getSchema;
const isAdminUser = Connector.isAdminUser;
const getAuthType = Connector.getAuthType;
