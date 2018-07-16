/**
 * @param {object} param an object containing config fields and requested fields that should be built into the request.
 *
 * @return {object} The request that would be passed from DataStudio.
 */
const buildFakeRequest = (params) => {
  var {
    startDate = '2018-03-19',
    endDate = '2018-04-15',
    fields = []
  } = params || {};
  const request = {};

  request.configParams = {};

  request.fields = buildFields(...fields);

  request.dateRange = {
    startDate: startDate,
    endDate: endDate
  };

  return request;
};

/**
 * @param {array} fieldNames The field names that are being requested.
 * @return {array} The fields being request by data studio.
 */
const buildFields = (...fieldNames) => {
  return fieldNames.map((name) => ({ name }));
};

export {
  buildFakeRequest
};
