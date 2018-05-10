const CustomCache = require('../src/CustomCache.gs');

/**
 * @param {object} param an object containing urlName, apiType, and fields that should be built into the request.
 * @return {object} The request that would be passed from DataStudio.
 */
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

/**
 * @param {array} fieldNames The field names that are being requested.
 * @return {array} The fields being request by data studio.
 */
const buildFields = (...fieldNames) => {
  return fieldNames.map((name) => ({name}));
};

/**
 * @param{object} param An objecting containing cacheData to populate the initial cache with.
 * @return {object} A cache with a mocked out spreadsheet.
 */
const initCache = (param) => {
  let {cacheData = []} = param || {};
  CustomCache.getPropertiesServiceNS = () => ({
    getUserProperties: () => ({getProperty: () => 3, setProperty: jest.fn()}),
  });

  const mySheet = {
    getAllValues: () => cacheData,
    appendRow: (row) => cacheData.push(row),
    getLastRow: () => cacheData.length + 1,
    getRange: () => ({
      getValues: () => cacheData,
      getLastRow: () => cacheData.length,
      getCell: (row, col) => ({getValue: () => cacheData[row - 1][col - 1]}),
    }),
  };
  const getSheetByNameMock = jest.fn(() => mySheet);

  CustomCache.getSpreadsheetAppNS = () => ({
    openById: () => ({getSheetByName: getSheetByNameMock}),
  });
  const cache = new CustomCache('urlName', 'apiType');
  return cache;
};

module.exports = {
  buildFakeRequest,
  buildFields,
  initCache,
};
