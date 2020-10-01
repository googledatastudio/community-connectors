function getDateFormated(date) {
  return Utilities.formatDate(date, 'America/Los_Angeles', 'YYYYMMddHHmmss');
}

function generateQueryString(data) {
  const params = [];
  for (var d in data) {
    params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return params.join('&');
}

function getDataArrayName(json) {
  name = '';
  Object.keys(json).forEach(function(key) {
    var value = json[key];
    if (Array.isArray(value)) {
      name = key;
      return;
    }
  });
  return name;
}

function getDataArrayValues(json) {
  data_value = [];
  Object.keys(json).forEach(function(key) {
    var value = json[key];
    if (Array.isArray(value)) {
      data_value = value;
      return;
    }
  });
  return data_value;
}
