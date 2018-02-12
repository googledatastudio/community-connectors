var CustomCache = require('../src/CustomCache.gs');
const {initCache} = require('./test-util.js');

test('initialization test no existing spreadsheet', () => {
  const scriptId = '3';
  const urlName = 'my url';
  const apiType = 'my api type';

  const getPropertyMock = jest.fn(() => null);
  const setPropertyMock = jest.fn();
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () =>
        ({getProperty: getPropertyMock, setProperty: setPropertyMock})
  });

  const mySheet = {};
  const insertSheetMock = jest.fn(() => mySheet);
  const getSheetByNameMock = jest.fn();
  getSheetByNameMock.mockReturnValueOnce(null);
  getSheetByNameMock.mockReturnValueOnce('second time something exists!');

  CustomCache.getSpreadsheetAppNS = () => ({
    create: () => ({
      getId: () => scriptId,
      getSheetByName: getSheetByNameMock,
      insertSheet: insertSheetMock
    })
  });

  const cache = new CustomCache(urlName, apiType);

  expect(insertSheetMock.mock.calls).toEqual([[CustomCache.buildSheetName(
      urlName, apiType)]]);
  expect(setPropertyMock.mock.calls).toEqual([
    [CustomCache.SCRIPT_ID_KEY, scriptId]
  ]);
  expect(cache.spreadsheet).toBeTruthy();
  expect(cache.sheet).toBeTruthy();
});

test('initialization test existing spreadsheet, no existing sheet', () => {
  const scriptId = '3';
  const urlName = 'my url';
  const apiType = 'my api type';

  const getPropertyMock = jest.fn(() => scriptId);
  const setPropertyMock = jest.fn();
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () =>
        ({getProperty: getPropertyMock, setProperty: setPropertyMock})
  });

  const mySheet = {};
  const insertSheetMock = jest.fn(() => mySheet);
  const getSheetByNameMock = jest.fn();
  getSheetByNameMock.mockReturnValueOnce(null);
  getSheetByNameMock.mockReturnValueOnce('second time something exists!');

  CustomCache.getSpreadsheetAppNS = () => ({
    openById: () => ({
      getId: () => scriptId,
      getSheetByName: getSheetByNameMock,
      insertSheet: insertSheetMock
    })
  });

  const cache = new CustomCache(urlName, apiType);

  expect(insertSheetMock.mock.calls).toEqual([[CustomCache.buildSheetName(
      urlName, apiType)]]);
  expect(setPropertyMock.mock.calls).toEqual([]);
  expect(cache.spreadsheet).toBeTruthy();
  expect(cache.sheet).toBeTruthy();
});

test('initialization test existing spreadsheet, no existing sheet', () => {
  const scriptId = '3';
  const urlName = 'my url';
  const apiType = 'my api type';

  const getPropertyMock = jest.fn(() => scriptId);
  const setPropertyMock = jest.fn();
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () =>
        ({getProperty: getPropertyMock, setProperty: setPropertyMock})
  });

  const mySheet = {};
  const insertSheetMock = jest.fn(() => mySheet);
  const getSheetByNameMock = jest.fn(() => 'something exists!');

  CustomCache.getSpreadsheetAppNS = () => ({
    openById: () => ({
      getId: () => scriptId,
      getSheetByName: getSheetByNameMock,
      insertSheet: insertSheetMock
    })
  });

  const cache = new CustomCache(urlName, apiType);

  expect(insertSheetMock.mock.calls).toEqual([]);
  expect(setPropertyMock.mock.calls).toEqual([]);
  expect(cache.spreadsheet).toBeTruthy();
  expect(cache.sheet).toBeTruthy();
});

test('initialization test spreadsheet deleted', () => {
  const scriptId = '3';
  const urlName = 'my url';
  const apiType = 'my api type';

  const getPropertyMock = jest.fn(() => scriptId);
  const setPropertyMock = jest.fn();
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () =>
        ({getProperty: getPropertyMock, setProperty: setPropertyMock})
  });

  const mySheet = {};
  const insertSheetMock = jest.fn(() => mySheet);
  const getSheetByNameMock = jest.fn();
  getSheetByNameMock.mockReturnValueOnce(null);
  getSheetByNameMock.mockReturnValueOnce('second time something exists!');

  CustomCache.getSpreadsheetAppNS = () => ({
    create: () => ({
      getId: () => scriptId,
      getSheetByName: getSheetByNameMock,
      insertSheet: insertSheetMock
    }),
    openById: () => {
      throw Error(
          'Document ' + scriptId + ' is missing (perhaps it was deleted).');
    }
  });

  const cache = new CustomCache(urlName, apiType);

  expect(insertSheetMock.mock.calls).toEqual([[CustomCache.buildSheetName(
      urlName, apiType)]]);
  expect(setPropertyMock.mock.calls).toEqual([
    [CustomCache.SCRIPT_ID_KEY, scriptId]
  ]);
  expect(cache.spreadsheet).toBeTruthy();
  expect(cache.sheet).toBeTruthy();
});

test('initialization test other error', () => {
  const scriptId = '3';
  const urlName = 'my url';
  const apiType = 'my api type';

  const getPropertyMock = jest.fn(() => scriptId);
  const setPropertyMock = jest.fn();
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () =>
        ({getProperty: getPropertyMock, setProperty: setPropertyMock})
  });

  const mySheet = {};
  const insertSheetMock = jest.fn(() => mySheet);
  const getSheetByNameMock = jest.fn();
  getSheetByNameMock.mockReturnValueOnce(null);
  getSheetByNameMock.mockReturnValueOnce('second time something exists!');
  global.console.log = jest.fn();

  CustomCache.getSpreadsheetAppNS = () => ({
    create: () => ({
      getId: () => scriptId,
      getSheetByName: getSheetByNameMock,
      insertSheet: insertSheetMock
    }),
    openById: () => {
      throw Error('error text');
    }
  });

  try {
    new CustomCache(urlName, apiType);
  } catch (e) {
    expect(e.message).toEqual('The sheet could not be created.');
  }
});

test('put & get', () => {
  const cache = initCache({cacheData: [['key', 'value']]});
  const key = '3';
  const value = {'my': 'value'};
  cache.put(key, value);
  const getValue = cache.get(key);
  expect(getValue).toEqual(value);
});

test('put 5 & get missing', () => {
  const cache = initCache({cacheData: []});
  let expected = [];
  for (let i = 0; i < 5; i++) {
    cache.put(i, {json: {i: i}, nextLink: 'hi.com'});
    expected = expected.concat({value: i});
  }
  const actual = cache.get(9);
  expect(actual).toEqual(undefined);
});

test('find index when missing', () => {
  const cache = initCache({cacheData: []});
  cache.put(1, {hi: 1});
  const actual = cache.findIndex(function(row) {
    return false;
  });
  expect(actual).toEqual(-1);
});

test('find index when found', () => {
  const cache = initCache({cacheData: []});
  let expected = [];
  for (let i = 0; i < 5; i++) {
    cache.put(i, {value: i});
    expected = expected.concat({value: i});
  }
  const actual = cache.findIndex(function(row) {
    return row[0] === '3';
  });
  expect(actual).toEqual(3);
});

test('put 5 & get 3 via getRestFrom', () => {
  const cache = initCache({cacheData: []});
  for (let i = 0; i < 5; i++) {
    var j = {json: 1, nextLink: 'next link'};
    cache.put(i, j);
  }

  const joiner = (acc, row) => {
    const cachedValue = JSON.parse(row[1]);
    const results = acc.json.concat(cachedValue.json);
    const nextLink = cachedValue.nextLink;
    return {json: results, nextLink: nextLink};
  };

  const actual = cache.getRestFrom(2, joiner, {json: [], nextLink: undefined});
  expect(actual).toEqual({json: [1, 1, 1], nextLink: 'next link'});
});
