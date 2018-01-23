const Connector = require('../src/Connector.gs');
const Schema = require('../src/schema.gs');

const buildFakeRequest = (param) => {
    var {urlName, apiType, fields = []} = param || {};
    const request = {};

    request.configParams = request.configParams || {};
    if (urlName) {
        request.configParams.url_name = urlName;
    }
    if (apiType) {
        request.configParams.api_type = apiType;
    }

    request.fields = fields;

    return request;
};

const buildFields = (...fieldNames) => {
    return fieldNames.map((name) => ({name}));
};

let c, urlFetchMock;

beforeEach(() => {
    c = new Connector();
    urlFetchMock = jest.fn();

    global.Connector = Connector;
    global.Schema = Schema;
    global.UrlFetchApp = {fetch: urlFetchMock};

    global.getOAuthService = () => ({
        getAccessToken: () => 'accesstoken'
    });
});


test('validateConfig test', () => {
    const request = buildFakeRequest();

    c.validateConfig(request);

    expect(request.configParams).toBeTruthy();
});

test('getSchema test', () => {
    const actual = c.getSchema();
    const expected = [];
    expect(actual).toBeTruthy();
});

test('buildURL only startTime test', () => {
    const request = buildFakeRequest();
    const startTime = '15oclock';
    const actual = c.buildURL(request, startTime);
    const expected = 'https://api.lyft.com/v1/rides?limit=50&start_time=15oclock';

    expect(actual).toEqual(expected);
});

test('buildURL both params', () => {
    const request = buildFakeRequest();
    const startTime = '15oclock';
    const endTime = '16oclock';
    const actual = c.buildURL(request, startTime, endTime);
    const expected = 'https://api.lyft.com/v1/rides?limit=50&start_time=15oclock&end_time=16oclock';

    expect(actual).toEqual(expected);
});

test('parseDate', () => {
    const actual = c.parseDate('2018-01-19T16:56:25+00:00');
    const expected = '20180119';
    expect(actual).toEqual(expected);
});

test('parseHour', () => {
    const actual = c.parseHour('2018-01-19T16:56:25+00:00');
    const expected = '16';
    expect(actual).toEqual(expected);
});

test('parseMinute', () => {
    const actual = c.parseMinute('2018-01-19T16:56:25+00:00');
    const expected = '56';
    expect(actual).toEqual(expected);
});

test('rowifyRides', () => {

    const fields = buildFields(
        'pickup_latlong',
        'dropoff_latlong',
        'pickup_date',
        'pickup_hour',
        'pickup_minute',
        'dropoff_date',
        'dropoff_hour',
        'dropoff_minute',
        'distance',
        'price',
        'ride_id',
        'ride_type'
    );
    const request = buildFakeRequest({fields});
    const dataSchema = c.getDataSchema(request);
    const apiResults = {
        "ride_history":[
            {
                "distance_miles":1.63,
                "dropoff":{
                    "lat":37.41743,
                    "lng":-122.08014,
                    "time":"2018-01-19T16:56:25+00:00"
                },
                "price":{"amount":387},
                "status":"droppedOff",
                "pickup":{
                    "lat":37.39868,
                    "lng":-122.07414,
                    "time":"2018-01-19T16:47:47+00:00",
                    "address":"599 Cypress Point Dr, Mountain View, CA "
                },
                "ride_id":"123",
                "ride_type":"lyft_line"
            }
        ]
    };
    const actual = c.rowifyRides(apiResults, dataSchema);
    const expected = [{"values": [
        "37.39868, -122.07414", "37.41743, -122.08014",
        "20180119", "16", "47",
        "20180119", "16", "56",
        1.63, 3.87, "123", "lyft_line"
    ]}];

    expect(actual).toEqual(expected);

});
