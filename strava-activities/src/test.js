function fakeGetDataRequest(dateRange) {
  return {
    fields: getFields()
      .asArray()
      .map(function(field) {
        return {
          name: field.getId(),
        };
      }),
    dateRange: dateRange,
  };
}

function testApiCallWithDateRange() {
  Logger.log(
    getData(
      fakeGetDataRequest({
        endDate: '2018-10-31',
        startDate: '2018-10-01',
      })
    )
  );
}

function testApiCall() {
  Logger.log(getData(fakeGetDataRequest()));
}
