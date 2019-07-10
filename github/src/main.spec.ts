function runTests() {
  runTest(
    getVariablesSameGroupTest,
    'Sets variables correctly',
    'Get variables test failed'
  );
  runTest(
    getIssuePageIntegrationTest,
    'Can get issues',
    'Get Issue page integration test failed'
  );
  runTest(
    issueGraphqlFetchTest,
    'Can get all issues',
    'issueGraphqlFetchTest failed'
  );
  // runTest(getDataTest, 'Can run getData', 'getDataTest failed');
  // runTest(
  //   getDataTest_justNumber,
  //   'Can run getData',
  //   'getDataTest_justNumber failed'
  // );
  runTest(getDataTest_starsStuff, 'Can get stars', 'getDataTest failed');
}

const runTest = (
  test: () => boolean,
  ifSuccessful: string,
  ifFailed: string
) => {
  if (test()) {
    Logger.log(ifSuccessful);
  } else {
    throw ifFailed;
  }
};

const getVariablesSameGroupTest = (): boolean => {
  const actual = Connector.getVariables(
    'stargazers',
    {organization: 'googledatastudio', repository: 'dscc-gen'},
    {
      asArray: () => [{getId: () => 'issues'}, {getId: () => 'stars'}]
    } as any
  );
  return actual.issues === true && actual.stars === true;
};

const getIssuePageIntegrationTest = (): boolean => {
  const variables = {
    organization: 'googledatastudio',
    repository: 'dscc-gen',
    issues: true,
    title: true
  };
  const actual = Connector.getPage(variables);
  // For googledatastudio/dscc-gen I know we have pull requests & issues.
  return (
    actual.data.organization.repository.issues.nodes.length > 0 &&
    actual.data.organization.repository.pullRequests.nodes.length > 0
  );
};

const issueGraphqlFetchTest = (): boolean => {
  const variables = {
    organization: 'googledatastudio',
    repository: 'dscc-gen',
    issues: true,
    title: true
  };
  const actual = Connector.graphqlFetch(variables);
  return actual.length > 0;
};

const getDataTest = (): boolean => {
  const request = {
    fields: [{name: 'title'}],
    configParams: {organization: 'googledatastudio', repository: 'dscc-gen'}
  };
  const actual = Connector.getData(request);
  return (
    actual.rows.length > 0 &&
    actual.schema.length > 0 &&
    actual.schema.length === actual.rows[0].values.length
  );
};

const getDataTest_justNumber = (): boolean => {
  const request = {
    fields: [{name: 'number'}, {name: 'num_comments'}],
    configParams: {organization: 'googledatastudio', repository: 'dscc-gen'}
  };
  const actual = Connector.getData(request);
  return (
    actual.rows.length > 0 &&
    actual.schema.length > 0 &&
    actual.schema.length === actual.rows[0].values.length
  );
};

const getDataTest_starsStuff = (): boolean => {
  const request = {
    fields: [{name: 'stars'}, {name: 'starred_at'}],
    configParams: {organization: 'googledatastudio', repository: 'dscc-gen'}
  };
  const actual = Connector.getData(request);
  Logger.log(actual);
  return (
    actual.rows.length > 0 &&
    actual.schema.length > 0 &&
    actual.schema.length === actual.rows[0].values.length
  );
};
