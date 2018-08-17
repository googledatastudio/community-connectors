var DateUtils = {
  /*
  * Converts Date object to a String containing the date part (with dashes).
  *
  * @return {String} Date part. E.g. '2018-07-10'.
  */
  getDatePart: function(dateObject) {
    return dateObject.toISOString().slice(0, 10);
  },

  /*
  * Converts Date object to a String containing the date part (without dashes).
  *
  * @return {String} Date part. E.g. '20180710'.
  */
  getDashlessDatePart: function(dateObject) {
    return DateUtils.getDatePart(dateObject).replace(/-/g, '');
  },

  /*
  * Converts Date object to a String containing the date part with hour (hour has zero prefix). Date part has no dashes.
  *
  * @return {String} Date part with hour. E.g. '2018071003'.
  */
  getDashlessDateWithHour: function(dateObject) {
    var hours = dateObject.getUTCHours();
    var hourPart = (hours < 10 ? '0' : '') + hours;
    return DateUtils.getDashlessDatePart(dateObject) + hourPart;
  }
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = DateUtils;
}
