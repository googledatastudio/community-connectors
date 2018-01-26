var Connector = require('../src/Connector.gs');
var Schema = require('../src/schema.gs');
var CustomCache = require('../src/CustomCache.gs');
var {buildFakeRequest, buildFields, initCache} = require('./test-util.js');

var urlFetchMock, errorMock, consoleLogMock, accessTokenMock, c;

beforeEach(() => {
  urlFetchMock = jest.fn(() => JSON.stringify({}));

  c = new Connector();

  errorMock = jest.fn();
  c.throwError = errorMock;

  consoleLogMock = jest.fn();
  global.console.log = consoleLogMock;

  global.Connector = Connector;
  global.Schema = Schema;
  global.CustomCache = CustomCache;
  global.UrlFetchApp = {fetch: urlFetchMock};

  global.getOAuthService = () => ({
    getAccessToken: () => 'accesstoken'
  });

  global.LockService = {
    getUserLock: () => ({
      waitLock: () => true,
      releaseLock: () => true
    })
  };
});


test('validateConfig test', () => {
  var request = buildFakeRequest();

  c.validateConfig(request);

  expect(request.configParams).toBeTruthy();
  expect(request.configParams.url_name).toBeTruthy();
  expect(request.configParams.api_type).toBeTruthy();
});

/** @return {object} the default request object */
const defaultRequest = () => new Connector().validateConfig({});

/** @return {object} the member request object */
const memberRequest = () => new Connector().validateConfig(
    buildFakeRequest({apiType: Connector.API_TYPE_MEMBERS}));

/** @return {object} the event request object */
const eventRequest = () => new Connector().validateConfig(
    buildFakeRequest({apiType: Connector.API_TYPE_EVENTS}));

/** @return {object} the proGroup request object */
const proGroupRequest = () => new Connector().validateConfig(
    buildFakeRequest({apiType: Connector.API_TYPE_PRO_GROUPS}));

/** @return {object} the generalInfo request object */
const generalInfoRequest = () => new Connector().validateConfig(
    buildFakeRequest({apiType: Connector.API_TYPE_GENERAL_INFO}));

/** @return {object} the badApiType request object */
const badApiTypeRequest = () =>
    new Connector().validateConfig(buildFakeRequest({apiType: 'bad api type'}));

test('Build member url test', () => {
  const request = memberRequest();
  var actual = c.buildURL(request);
  var expected =
      'https://api.meetup.com/Igniter/members?&sign=true&photo-host=public&only=id,joined,status,lat,lon,city,state&page=100';

  expect(actual).toEqual(expected);
});

test('Build event url test', () => {
  const request = eventRequest();
  var actual = c.buildURL(request);
  var expected =
      'https://api.meetup.com/Igniter/events?&page=100&only=name,time,waitlist_count,yes_rsvp_count,link,fee';

  expect(actual).toEqual(expected);
});


test('Build general_info url test', () => {
  var request = generalInfoRequest();
  var actual = c.buildURL(request);
  var expected =
      'https://api.meetup.com/Igniter?&only=name,link,members,group_photo.photo_link,meta_category';

  expect(actual).toEqual(expected);
});

test('buildURL with pro group', () => {
  const request = proGroupRequest();
  var actual = c.buildURL(request);
  var expected =
      'https://api.meetup.com/pro/Igniter/groups?&page=100&only=id,name,lat,lon,city,country,member_count,average_age,founded_date,past_events,upcoming_events,past_rsvps,rsvps_per_event,repeat_rsvpers,gender_unknown,gender_female,gender_male,gender_other';


  expect(actual).toEqual(expected);
});

test('Build url with bad api_type', () => {
  var request = badApiTypeRequest();
  c.validateConfig(request);
  c.buildURL(request);
  expect(errorMock.mock.calls).toEqual([
    ['An invalid value was passed to api type: bad api type', false]
  ]);
});

test('getCachedData creates cache if undefined.', () => {
  var mockConstructor = function() {};
  mockConstructor.prototype.getRestFrom = () => {};
  global.CustomCache = mockConstructor;
  c.getFromCachePaginated = () => 'not null';

  const request = defaultRequest();
  expect(c.cache).toBeNull();
  c.getCachedData(request, undefined, undefined);
  expect(c.cache).toBeTruthy();
});

test('getCachedData with populated cache', () => {
  var url = 'my url';
  var request = defaultRequest();
  var cachedValue = {json: 'data'};

  c.cache = initCache({cacheData: [[url, JSON.stringify(cachedValue)]]});

  var actual = c.getCachedData(request, url, undefined);
  var expected = {json: ['data'], nextLink: undefined};
  expect(actual).toEqual(expected);
});

test(
    'getCachedData with miss & do not add to cache because not enough responses url',
    () => {
      c.cache = initCache({});
      c.getNextLink = () => 'my next link';

      c.getCachedData(undefined, undefined, undefined);
      expect(c.cache.sheet.getAllValues()).toEqual([]);
    });

test(
    'getCachedData with miss & do not add to cache because missing url', () => {
      let response = [];
      for (let i = 0; i < 100; i++) {
        response.push({'my': 'response'});
      }
      urlFetchMock.mockImplementation(() => JSON.stringify(response));

      c.cache = initCache({});
      c.getNextLink = () => undefined;

      var actual = c.getCachedData(undefined, undefined, undefined);
      var expected = {json: response, nextLink: undefined};
      expect(actual).toEqual(expected);
    });

test('getCachedData with miss & do add to cache', () => {
  let response = [];
  for (var i = 0; i < 100; i++) {
    response.push(0);
  }

  urlFetchMock.mockImplementation(() => JSON.stringify(response));
  c.cache = initCache({});
  const nextLink = 'my next link';
  c.getNextLink = () => nextLink;

  const url = 'my url';
  c.getCachedData(undefined, url, undefined);
  expect(c.cache.sheet.getAllValues()).toEqual([
    [url, JSON.stringify({json: response, nextLink: nextLink})]
  ]);
});

test('getNextLink without rel=next', () => {
  const fakeResponse = {getAllHeaders: () => ({})};

  const actual = c.getNextLink(fakeResponse);
  expect(actual).toBeUndefined();
});

test('getNextLink with rel=next', () => {
  const linkValue = 'mylink.com';

  const fakeResponse = {
    getAllHeaders: () =>
        ({Link: ['<link>; rel="notNext"', `<${linkValue}>; rel="next"`]})
  };

  const actual = c.getNextLink(fakeResponse);
  const expected = linkValue;
  expect(actual).toEqual(expected);
});

test('getNextLink with rel=next and one entry', () => {
  const linkValue = 'mylink.com';

  const fakeResponse = {
    getAllHeaders: () => ({Link: `<${linkValue}>; rel="next"`})
  };

  const actual = c.getNextLink(fakeResponse);
  const expected = linkValue;
  expect(actual).toEqual(expected);
});

test('rowifyProGroupData with nonexisting field', () => {
  c.rowifyProGroupData(['result 1'], [{name: 'nah'}]);

  expect(errorMock.mock.calls[0]).toEqual([
    'A field was requested that is not in the schema: nah', true
  ]);
});

test('rowifyMemberData with nonexisting field', () => {
  c.rowifyMemberData(['result 1'], [{name: 'nah'}]);
  expect(errorMock.mock.calls[0]).toEqual([
    'A field was requested that is not in the schema: nah', true
  ]);
});

test('rowifyGeneralInfo with nonexisting field', () => {
  c.rowifyGeneralInfo(['result 1'], [{name: 'nah'}]);
  expect(errorMock.mock.calls[0]).toEqual([
    'A field was requested that is not in the schema: nah', true
  ]);
});

test('rowifyEventData with nonexisting field', () => {
  c.rowifyEventData(['result 1'], [{name: 'nah'}]);
  expect(errorMock.mock.calls[0]).toEqual([
    'A field was requested that is not in the schema: nah', true
  ]);
});

test('rowifyMemberData', () => {
  const fakeApiResults = [
    {
      'lon': -122.08,
      'lat': 37.41,
      'city': 'Mountain View',
      'state': 'CA',
      'country': 'us',
      'joined': 1513774300000,
      'status': 'active',
      'id': 244280134
    },
    {
      'lon': -122.04,
      'lat': 37.31,
      'city': 'Cupertino',
      'state': 'CA',
      'country': 'us',
      'joined': 1425871866000,
      'status': 'active',
      'id': 185082582
    },
    {
      'lon': -121.92,
      'lat': 37.26,
      'city': 'San Jose',
      'state': 'CA',
      'country': 'us',
      'joined': 1374464531000,
      'status': 'active',
      'id': 103282372
    }
  ];
  var request = buildFakeRequest({
    fields: [
      {name: 'joined'}, {name: 'id'}, {name: 'status'}, {name: 'latlong'},
      {name: 'city'}, {name: 'state'}
    ]
  });

  var dataSchema = c.getDataSchema(request);
  const actual = c.rowifyMemberData(fakeApiResults, dataSchema);
  const expected = [
    {
      'values': [
        '20171220', 244280134, 'active', '37.41, -122.08', 'Mountain View', 'CA'
      ]
    },
    {
      'values': [
        '20150309', 185082582, 'active', '37.31, -122.04', 'Cupertino', 'CA'
      ]
    },
    {
      'values': [
        '20130722', 103282372, 'active', '37.26, -121.92', 'San Jose', 'CA'
      ]
    }
  ];


  expect(actual).toEqual(expected);
});

test('rowify general_info', () => {
  const apiResult = {
    'meta_category':
        {'name': 'Tech', 'photo': {'photo_link': 'tech_photo_link'}},
    'group_photo': {'photo_link': 'group_photo_link'},
    'members': 1956,
    'link': 'group link',
    'name': 'Group Name'
  };
  const request = buildFakeRequest({
    fields: [
      {name: 'category'},
      {name: 'category_photo_url'},
      {name: 'group_photo_url'},
      {name: 'members_count'},
      {name: 'group_link'},
      {name: 'group_name'},
    ],
    apiType: Connector.API_TYPE_GENERAL_INFO
  });

  const dataSchema = c.getDataSchema(request);
  const actual = c.rowifyGeneralInfo(apiResult, dataSchema);
  const expected = [{
    values: [
      'Tech', 'tech_photo_link', 'group_photo_link', 1956, 'group link',
      'Group Name'
    ]
  }];
  expect(actual).toEqual(expected);
});

test('rowifyProGroupData', () => {
  const apiResult = [{
    'id': 27009522,
    'name': 'GDG-Beja',
    'lat': 36.72999954223633,
    'lon': 9.1899995803833,
    'city': 'Bajah',
    'country': 'Tunisia',
    'member_count': 10,
    'average_age': 30,
    'founded_date': 1514718215000,
    'past_events': 1,
    'upcoming_events': 2,
    'past_rsvps': 3,
    'rsvps_per_event': 4,
    'repeat_rsvpers': 5,
    'gender_unknown': 0.1,
    'gender_female': 0.2,
    'gender_male': 0.3,
    'gender_other': 0.4,
    'status': 'Active'
  }];
  const request = buildFakeRequest({
    fields: [
      {name: 'id'},
      {name: 'name'},
      {name: 'latlong'},
      {name: 'city'},
      {name: 'country'},
      {name: 'member_count'},
      {name: 'average_age'},
      {name: 'founded_date'},
      {name: 'past_events'},
      {name: 'upcoming_events'},
      {name: 'past_rsvps'},
      {name: 'rsvps_per_event'},
      {name: 'repeat_rsvpers'},
      {name: 'gender_unknown'},
      {name: 'gender_female'},
      {name: 'gender_male'},
      {name: 'gender_other'},
    ],
    apiType: Connector.API_TYPE_PRO_GROUPS
  });

  const dataSchema = c.getDataSchema(request);
  const actual = c.rowifyProGroupData(apiResult, dataSchema);
  const expected = [{
    'values': [
      27009522, 'GDG-Beja', '36.72999954223633, 9.1899995803833', 'Bajah',
      'Tunisia', 10, 30, '20171231', 1, 2, 3, 4, 5, 1, 2, 3, 4
    ]
  }];
  expect(actual).toEqual(expected);
});

test(
    'getDataSchema correctly builds schema object with multiple fields requested',
    () => {
      var fields = buildFields('joined', 'year_month');
      var request = buildFakeRequest({fields});

      var actual = c.getDataSchema(request);
      expect(actual.length).toEqual(2);
    });

test(
    'getDataSchema correctly builds schema object with only 1 field requested',
    () => {
      var fields = buildFields('id');
      var request = buildFakeRequest({fields});

      c.validateConfig(request);
      var actual = c.getDataSchema(request);
      expect(actual.length).toEqual(1);
    });

test(
    'getDataSchema throwsError when field not in the schema requested.', () => {
      var fields = buildFields('not here');
      var request = buildFakeRequest({fields});

      c.validateConfig(request);
      c.getDataSchema(request);
      expect(errorMock.mock.calls).toEqual([
        ['A field was requested that was not in the schema: not here', false]
      ]);
    });

test('getDataCalls calls correct functions when passed event api type', () => {
  const request = eventRequest();
  c.requestEventsData = jest.fn(() => 'events data');
  c.rowifyEventData = jest.fn(() => 'rowified events data');
  c.getDataSchema = jest.fn(() => 'get data schema');
  const actual = c.getData(request);
  const expected = {schema: 'get data schema', rows: 'rowified events data'};
  expect(actual).toEqual(expected);
});

test('getDataCalls calls correct functions when passed member api type', () => {
  const request = memberRequest();
  c.paginatedResult = jest.fn(() => 'events data');
  c.rowifyMemberData = jest.fn(() => 'rowified events data');
  c.getDataSchema = jest.fn(() => 'get data schema');
  const actual = c.getData(request);
  const expected = {schema: 'get data schema', rows: 'rowified events data'};
  expect(actual).toEqual(expected);
});

test(
    'getDataCalls calls correct functions when passed general_info api type',
    () => {
      const request = generalInfoRequest();
      c.requestGeneralInfo = jest.fn(() => 'general info data');
      c.rowifyGeneralInfo = jest.fn(() => 'rowified events data');
      c.getDataSchema = jest.fn(() => 'get data schema');
      const actual = c.getData(request);
      const expected = {
        schema: 'get data schema',
        rows: 'rowified events data'
      };
      expect(actual).toEqual(expected);
    });

test('getDataCalls calls correct functions when passed bad api type', () => {
  const request = badApiTypeRequest();
  errorMock.mockImplementation(() => {
    throw new Error('for test');
  });
  try {
    c.getData(request);
  } catch (e) {
    expect(e.message).toEqual('for test');
  }
  expect(errorMock.mock.calls).toEqual([
    ['An invalid value was passed to apiType: bad api type', false]
  ]);
});

test('throwError adds correct prefix when user safe', () => {
  var error;
  try {
    var c = new Connector();
    var actual = c.throwError('Some failure message', true);
  } catch (e) {
    error = e;
  }
  if (error === undefined) {
    fail();
  }
  var expected = 'DS_USER:Some failure message';
  var actual = error.message;
  expect(actual).toEqual(expected);
});

test('getSchema returns correct schema by default', () => {
  var request = defaultRequest();
  const actual = c.getSchema(request);
  const expected = (new Schema()).getSchema(Connector.API_TYPE_MEMBERS);
  expect(actual).toEqual(expected);
});

test('getSchema returns correct schema for events', () => {
  var request = eventRequest();
  const actual = c.getSchema(request);
  const expected = (new Schema()).getSchema(Connector.API_TYPE_EVENTS);
  expect(actual).toEqual(expected);
});

test('getSchema returns correct schema for general_info', () => {
  var request = generalInfoRequest();
  const actual = c.getSchema(request);
  const expected = (new Schema()).getSchema(Connector.API_TYPE_GENERAL_INFO);
  expect(actual).toEqual(expected);
});

test('rowify event data works as expected', () => {
  const apiResults = [
    {
      'fee': {'amount': 10},
      'link': 'fakeLink',
      'yes_rsvp_count': 12,
      'name': 'event 1 name',
      'waitlist_count': 1,
      'time': 1519354800000
    },
    {
      'link': 'fakeLink',
      'yes_rsvp_count': 12,
      'name': 'event 1 name',
      'waitlist_count': 1,
      'time': 1519354800000
    },
    {
      'fee': {'amount': 25},
      'link': 'fakeLink2',
      'yes_rsvp_count': 10,
      'name': 'event 2 name',
      'waitlist_count': 0,
      'time': 1529632800000
    }
  ];
  var request = buildFakeRequest({
    apiType: Connector.API_TYPE_EVENTS,
    fields: [
      {name: 'name'}, {name: 'event_date'}, {name: 'waitlist_count'},
      {name: 'yes_rsvp_count'}, {name: 'link'}, {name: 'fee'},
      {name: 'event_time'}
    ]
  });
  const dataSchema = c.getDataSchema(request);
  const actual = c.rowifyEventData(apiResults, dataSchema);
  const expected = [
    {values: ['event 1 name', '20180223', 1, 12, 'fakeLink', 10, '03:00']},
    {values: ['event 1 name', '20180223', 1, 12, 'fakeLink', 0, '03:00']},
    {values: ['event 2 name', '20180622', 0, 10, 'fakeLink2', 25, '02:00']}
  ];

  expect(actual).toEqual(expected);
});

test('requestEventsData does the right things.', () => {
  const response = [
    {
      'fee': {
        'accepts': 'paypal',
        'amount': 10,
        'currency': 'USD',
        'description': 'per person',
        'label': 'price',
        'required': true
      },
      'link': 'https://www.meetup.com/Igniter/events/244824517/',
      'yes_rsvp_count': 12,
      'waitlist_count': 0,
      'time': 1519354800000
    },
    {
      'fee': {
        'accepts': 'paypal',
        'amount': 25,
        'currency': 'USD',
        'description': 'per person',
        'label': 'price',
        'required': true
      },
      'link': 'https://www.meetup.com/Igniter/events/244743694/',
      'yes_rsvp_count': 10,
      'waitlist_count': 0,
      'time': 1529632800000
    }
  ];

  const request = buildFakeRequest({
    apiType: Connector.API_TYPE_EVENTS,
    fields: [
      {name: 'event_date'}, {name: 'waitlist_count'}, {name: 'yes_rsvp_count'},
      {name: 'link'}, {name: 'fee'}, {name: 'event_time'}
    ]
  });
  urlFetchMock.mockImplementation(() => JSON.stringify(response));
  c.getFetchOptions = () => ({});
  const url = c.buildURL(request);
  const actual = c.requestEventsData(request, url);
  expect(actual).toEqual(response);
});

test('errors are handled in getCachedData', () => {
  c.cache = 'not null';
  c.getFromCachePaginated = jest.fn();
  c.getCachedData();
  expect(errorMock.mock.calls[0]).toEqual([
    'Unable to get data from meetup.com', true
  ]);
});

test('paginatedResult test', () => {

  var counter = 0;
  const json = ['my json', 'response'];
  c.getCachedData = jest.fn(() => {
    if (counter < 2) {
      counter++;
      return {nextLink: 'my next link', json};
    } else {
      return {nextLink: undefined, json};
    }
  });

  const actual = c.paginatedResult(undefined, undefined);
  expect(actual).toEqual(json.concat(json).concat(json));
});

test('getFetchOptions test', () => {

  const actual = c.getFetchOptions();
  expect(actual).toEqual(
      {'headers': {'Authorization': 'Bearer accesstoken'}});
});

test('requestGeneralInfo test', () => {
  urlFetchMock.mockImplementation(() => JSON.stringify({}));
  const actual = c.requestGeneralInfo();
  expect(actual).toEqual({});
});

test('getConfig test', () => {
  const actual = c.getConfig();
  expect(actual.configParams).toBeTruthy();
});

test('getAuthType test', () => {
  const actual = c.getAuthType();
  expect(actual.type).toBeTruthy();
});

test('isAdminUser test', () => {
  const actual = c.isAdminUser();
  expect(actual).toBe(false);
});

test('logAndExecute defined function name, isAdminUser true, and log enabled true', () => {
  const functionName = 'myFunctionName';
  const parameter = 5;
  c[functionName] = (x) => x;
  c.isAdminUser = () => true;
  c.logEnabled = true;
  const actual = c.logAndExecute(functionName, parameter);
  expect(actual).toBe(5);
  expect(consoleLogMock.mock.calls).toEqual([
    [[functionName, 'request', JSON.stringify(parameter)]],
    [[functionName, 'response', JSON.stringify(parameter)]]
  ]);
});

test('logAndExecute defined function name, isAdminUser true, and log enabled false', () => {
  const functionName = 'myFunctionName';
  const parameter = 5;
  c[functionName] = (x) => x;
  c.isAdminUser = () => true;
  c.logEnabled = false;
  const actual = c.logAndExecute(functionName, parameter);
  expect(actual).toBe(5);
  expect(consoleLogMock.mock.calls).toEqual([]);
});

test('logAndExecute defined function name, isAdminUser false, and log enabled true', () => {
  const functionName = 'myFunctionName';
  const parameter = 5;
  c[functionName] = (x) => x;
  c.isAdminUser = () => false;
  c.logEnabled = true;
  const actual = c.logAndExecute(functionName, parameter);
  expect(actual).toBe(5);
  expect(consoleLogMock.mock.calls).toEqual([]);
});

test('logAndExecute undefined function name', () => {
  const functionName = 'myFunctionName';
  const parameter = 5;
  c.logAndExecute(functionName, parameter);
  expect(errorMock.mock.calls[0]).toEqual([
    'The function you are trying to log is not defined: myFunctionName', false
  ]);
});

test('timestampToUTCTime before miltary time different', () => {
  const actual = c.timeStampToUTCTime(1515028145088);
  expect(actual).toEqual('01:09');
});

test('timestampToUTCTime after military time different', () => {
  const actual = c.timeStampToUTCTime(1515088245088);
  expect(actual).toEqual('17:50');
});
