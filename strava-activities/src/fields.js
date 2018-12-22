function getFields() {
  // TODO(mjhamrick) - use config params to ask if the user wants meters, miles, or both for their schema fields.

  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('start_latlng')
    .setName('Starting Location')
    .setType(types.LATITUDE_LONGITUDE)
    .setDescription('The starting latitude and longitude');

  fields
    .newDimension()
    .setId('end_latlng')
    .setName('Ending Location')
    .setType(types.LATITUDE_LONGITUDE)
    .setDescription('The ending latitude and longitude');

  fields
    .newDimension()
    .setId('location_country')
    .setName('Country')
    .setType(types.COUNTRY)
    .setDescription('The country the activity took place in.');

  fields
    .newMetric()
    .setId('average_cadence')
    .setName('Average Cadence')
    .setType(types.NUMBER)
    .setDescription('The average cadence during the activity.');

  fields
    .newMetric()
    .setId('average_temp')
    .setName('Average Temperature')
    .setType(types.NUMBER)
    .setDescription('The average temperature during the activity.');

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
    .newMetric()
    .setId('distance_miles')
    .setName('Distance (mi)')
    .setType(types.NUMBER)
    .setDescription("The activity's distance, in miles.")
    .setFormula('$distance / 1609.34');

  fields
    .newMetric()
    .setId('total_elevation_gain')
    .setName('Total Elevation Gain (m)')
    .setType(types.NUMBER)
    .setDescription("The activity's total elevation gain, in meters.");

  fields
    .newMetric()
    .setId('max_speed')
    .setName('Max Speed (m/s)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.NO_AGGREGATION)
    .setDescription("The activity's max speed, in meters per second");

  fields
    .newMetric()
    .setId('average_speed')
    .setName('Average Speed (m/s)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG)
    .setFormula('$distance / CAST($moving_time AS NUMBER)')
    .setDescription(
      'The average speed across selected activities, in meters per second'
    );

  fields
    .newMetric()
    .setId('distance_feet')
    .setName('Distance (feet)')
    .setType(types.NUMBER)
    .setDescription("The activity's distance, in feet.")
    .setFormula('$distance * 3.28084');

  fields
    .newMetric()
    .setId('total_elevation_gain_feet')
    .setName('Total Elevation Gain (feet)')
    .setType(types.NUMBER)
    .setDescription("The activity's total elevation gain, in feet.")
    .setFormula('$total_elevation_gain * 3.28084');

  fields
    .newMetric()
    .setId('max_speed_mph')
    .setName('Max Speed (mph)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.NO_AGGREGATION)
    .setDescription("The activity's max speed, in miles per hour")
    .setFormula('$max_speed * 2.23694');

  fields
    .newMetric()
    .setId('average_speed_mph')
    .setName('Average Speed (mph)')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG)
    .setFormula('$distance / CAST($moving_time AS NUMBER) * 2.23694')
    .setDescription(
      'The average speed across selected activities, in miles per hour'
    );

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
    .newDimension()
    .setId('mile_pace')
    .setName('Mile Pace')
    .setType(types.DURATION)
    // There are 1609.34 meters in a mile.
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 1609.34')
    .setDescription('1 mile pace.');

  fields
    .newDimension()
    .setId('5k_pace')
    .setName('5k Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 5000')
    .setDescription('5 kilometer pace.');

  fields
    .newDimension()
    .setId('10k_pace')
    .setName('10k Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 10000')
    .setDescription('10 kilometer pace.');

  fields
    .newDimension()
    .setId('half_marathon_pace')
    .setName('Half Marathon Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 21097.5')
    .setDescription('half marathon pace.');

  fields
    .newDimension()
    .setId('marathon_pace')
    .setName('Marathon Pace')
    .setType(types.DURATION)
    .setFormula('CAST($moving_time AS NUMBER) / $distance * 42195')
    .setDescription('marathon pace');

  fields
    .newDimension()
    .setId('race_type')
    .setName('Race Type')
    .setType(types.TEXT)
    .setDescription('Type of race. Determined by distance.')
    .setFormula(
      "CASE\
  WHEN $distance >=  1609 AND $distance <  1700 THEN '1 Mile'\
  WHEN $distance >=  5000 AND $distance <  5100 THEN '5k'\
  WHEN $distance >= 10000 AND $distance < 11000 THEN '10k'\
  WHEN $distance >= 21097 AND $distance < 21200 THEN 'Half Marathon'\
  WHEN $distance >= 42195 AND $distance < 42300 THEN 'Full Marathon'\
  ELSE 'Other'\
END\
"
    );

  fields
    .newDimension()
    .setId('distance_bucket')
    .setName('Distance Bucket')
    .setType(types.TEXT)
    .setDescription('Distance grouped in 2 kilometer buckets.')
    .setFormula(
      "CASE\
  WHEN $distance <  2000                       THEN '<2k'\
  WHEN $distance >= 2000 AND $distance <  7000 THEN '2-7k'\
  WHEN $distance >= 7000 AND $distance < 12000 THEN '7-12k'\
  WHEN $distance >= 12000                      THEN '12k+'\
END\
"
    );

  return fields;
}
