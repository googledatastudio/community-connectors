function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('id')
    .setName('Activity ID')
    .setType(types.TEXT)
    .setDescription('The unique identifier of the activity');

  fields
    .newDimension()
    .setId('name')
    .setName('Activity Name')
    .setType(types.TEXT)
    .setDescription('The name of the activity.');

  fields
    .newDimension()
    .setId('type')
    .setName('Activity Type')
    .setType(types.TEXT)
    .setDescription('The type of the activity.');

  fields
    .newMetric()
    .setId('distance')
    .setName('Distance (m)')
    .setType(types.NUMBER)
    .setDescription("The activity's distance, in meters.");

  fields
    .newDimension()
    .setId('moving_time')
    .setName('Moving Time')
    .setType(types.DURATION)
    .setDescription("The activity's moving time, in seconds.");

  fields
    .newDimension()
    .setId('elapsed_time')
    .setName('Elapsed Time')
    .setType(types.DURATION)
    .setDescription("The activity's elapsed time, in seconds");

  fields
    .newMetric()
    .setId('total_elevation_gain')
    .setName('Total Elevation Gain')
    .setType(types.NUMBER)
    .setDescription("The activity's total elevation gain.");

  fields
    .newDimension()
    .setId('start_date_local')
    .setName('Start Date Local')
    .setType(types.YEAR_MONTH_DAY_HOUR)
    .setDescription('The local time at which the activity was started.');

  fields
    .newDimension()
    .setId('commute')
    .setName('Is Commute')
    .setType(types.BOOLEAN)
    .setDescription('Whether this activity is a commute');

  fields
    .newMetric()
    .setId('average_speed')
    .setName('Average Speed (m/s)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.NO_AGGREGATION)
    .setDescription("The activity's average speed, in meters per second");

  fields
    .newMetric()
    .setId('max_speed')
    .setName('Max Speed (m/s)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.NO_AGGREGATION)
    .setDescription("The activity's max speed, in meters per second");

  // formulas
  fields
    .newDimension()
    .setId('mile_pace')
    .setName('Mile Pace')
    .setType(types.DURATION)
    // There are 1609.34 meters in a mile.
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 1609.34');

  fields
    .newDimension()
    .setId('5k_pace')
    .setName('5k Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 5000');

  fields
    .newDimension()
    .setId('10k_pace')
    .setName('10k Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 10000');

  return fields;
}
