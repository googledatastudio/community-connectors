/* istanbul ignore next line */
if (typeof(require) !== 'undefined') {
  var DateUtils = require('./DateUtils.js')['default'];
}

/**
 * Constructor for DataBuilder - a service for converting Spotify plays to the format expected by GDS.
 *
 * @param dataSchema {array[object]} - Array of requested fields
 *
 * @return {object} a DataBuilder object.
 */
function DataBuilder(dataSchema) {
  this.dataSchema = dataSchema;

  return this;
}

/**
 * @param play {object} - A spotify play object
 *
 * @return {array} Array of values for each requested field
 */
DataBuilder.prototype.build = function(play) {
  var values = [];
  var playTime = new Date(play.played_at);

  this.dataSchema.forEach(function(field) {
    switch (field.name) {
    case 'track_name':
      values.push(play.track.name);
      break;
    case 'artist':
      values.push(play.track.artists[0].name);
      break;
    case 'played_at_hour':
      values.push(DateUtils.getDashlessDateWithHour(playTime));
      break;
    case 'played_at_date':
      values.push(DateUtils.getDashlessDatePart(playTime));
      break;
    case 'popularity':
      values.push(play.track.popularity);
      break;
    default:
      console.log('Unknown field:', field.name);
      values.push('');
    }
  });

  return values;
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = DataBuilder;
}
