// vim: ft=javascript:ts=2:sw=2
/*
Copyright 2017 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function GoogleFit(client_id, client_secret) {
  this.config = {};
  this.config.OAUTH_CLIENT_ID = client_id;
  this.config.OAUTH_CLIENT_SECRET = client_secret;

  /*
   * A map of activity type names to activity code.
   * @const
   * @see {@link https://developers.google.com/fit/rest/v1/reference/activity-types|Google Fit activity types}
   */
  this.ACTIVITY_TYPE = {
    IN_VEHICLE:                                   0,
    BIKING:                                       1,
    ON_FOOT:                                      2,
    "STILL (NOT MOVING)":                         3,
    "UNKNOWN (UNABLE TO DETECT ACTIVITY)":        4,
    "TILTING (SUDDEN DEVICE GRAVITY CHANGE)":     5,
    WALKING:                                      7,
    RUNNING:                                      8,
    AEROBICS:                                     9,
    BADMINTON:                                    10,
    BASEBALL:                                     11,
    BASKETBALL:                                   12,
    BIATHLON:                                     13,
    HANDBIKING:                                   14,
    MOUNTAIN_BIKING:                              15,
    ROAD_BIKING:                                  16,
    SPINNING:                                     17,
    STATIONARY_BIKING:                            18,
    UTILITY_BIKING:                               19,
    BOXING:                                       20,
    CALISTHENICS:                                 21,
    CIRCUIT_TRAINING:                             22,
    CRICKET:                                      23,
    CURLING:                                      106,
    DANCING:                                      24,
    DIVING:                                       102,
    ELLIPTICAL:                                   25,
    ERGOMETER:                                    103,
    FENCING:                                      26,
    "FOOTBALL (AMERICAN)":                        27,
    "FOOTBALL (AUSTRALIAN)":                      28,
    "FOOTBALL (SOCCER)":                          29,
    FRISBEE:                                      30,
    GARDENING:                                    31,
    GOLF:                                         32,
    GYMNASTICS:                                   33,
    HANDBALL:                                     34,
    HIKING:                                       35,
    HOCKEY:                                       36,
    HORSEBACK_RIDING:                             37,
    HOUSEWORK:                                    38,
    ICE_SKATING:                                  104,
    JUMPING_ROPE:                                 39,
    KAYAKING:                                     40,
    KETTLEBELL_TRAINING:                          41,
    KICKBOXING:                                   42,
    KITESURFING:                                  43,
    MARTIAL_ARTS:                                 44,
    MEDITATION:                                   45,
    MIXED_MARTIAL_ARTS:                           46,
    P90X_EXERCISES:                               47,
    PARAGLIDING:                                  48,
    PILATES:                                      49,
    POLO:                                         50,
    RACQUETBALL:                                  51,
    ROCK_CLIMBING:                                52,
    ROWING:                                       53,
    ROWING_MACHINE:                               54,
    RUGBY:                                        55,
    JOGGING:                                      56,
    RUNNING_ON_SAND:                              57,
    "RUNNING (TREADMILL)":                        58,
    SAILING:                                      59,
    SCUBA_DIVING:                                 60,
    SKATEBOARDING:                                61,
    SKATING:                                      62,
    CROSS_SKATING:                                63,
    INDOOR_SKATING:                               105,
    "INLINE_SKATING (ROLLERBLADING)":             64,
    SKIING:                                       65,
    "BACK-COUNTRY SKIING":                        66,
    "CROSS-COUNTRY SKIING":                       67,
    DOWNHILL_SKIING:                              68,
    KITE_SKIING:                                  69,
    ROLLER_SKIING:                                70,
    SLEDDING:                                     71,
    SLEEPING:                                     72,
    LIGHT_SLEEP:                                  109,
    DEEP_SLEEP:                                   110,
    REM_SLEEP:                                    111,
    "AWAKE (DURING SLEEP CYCLE)":                 112,
    SNOWBOARDING:                                 73,
    SNOWMOBILE:                                   74,
    SNOWSHOEING:                                  75,
    SQUASH:                                       76,
    STAIR_CLIMBING:                               77,
    "STAIR-CLIMBING MACHINE":                     78,
    "STAND-UP PADDLEBOARDING":                    79,
    STRENGTH_TRAINING:                            80,
    SURFING:                                      81,
    SWIMMING:                                     82,
    "SWIMMING (OPEN WATER)":                      84,
    "SWIMMING (SWIMMING POOL)":                   83,
    "TABLE TENNIS (PING PONG)":                   85,
    TEAM_SPORTS:                                  86,
    TENNIS:                                       87,
    "TREADMILL (WALKING OR RUNNING)":             88,
    VOLLEYBALL:                                   89,
    "VOLLEYBALL (BEACH)":                         90,
    "VOLLEYBALL (INDOOR)":                        91,
    WAKEBOARDING:                                 92,
    "WALKING (FITNESS)":                          93,
    NORDING_WALKING:                              94,
    "WALKING (TREADMILL)":                        95,
    WATERPOLO:                                    96,
    WEIGHTLIFTING:                                97,
    WHEELCHAIR:                                   98,
    WINDSURFING:                                  99,
    YOGA:                                         100,
    ZUMBA:                                        101,

    "OTHER (UNCLASSIFIED FITNESS ACTIVITY)":      108
  };

  // Create a reverse map of activity codes to name.
  this.ACTIVITY_MAP = {};

  for (var key in this.ACTIVITY_TYPE) {
    if (this.ACTIVITY_TYPE.hasOwnProperty(key)) {
      this.ACTIVITY_MAP[this.ACTIVITY_TYPE[key]] = key;
    }
  }
}

/**
 * Gets the description for the activity given the activity ID.
 * @param {number} The activity ID
 * @return {string} The activity description
 */
GoogleFit.prototype.getActivityDescription = function(id) {
  return this.ACTIVITY_MAP[id];
};

/**
 * Gets an OAuth2 service abject for Google Fit.
 *
 * @return {Object} OAuth2 library service object.
 */
GoogleFit.prototype.getService = function() {
  if (this._service) {
    return this._service;
  }
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  this._service = OAuth2.createService('fitness')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(this.config.OAUTH_CLIENT_ID)
      .setClientSecret(this.config.OAUTH_CLIENT_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      .setScope('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline');

  return this._service;
};



/**
 * Gets activity for the signed in user during the given time period.
 *
 * @param{Date} startTime the start time for the period to get activity
 * @param{Date} endTime the end time for the period to get activity
 * @return {Object} a Google Fit activity API JSON response.
*/
GoogleFit.prototype.getActivity = function(startTime, endTime) {
  return this._getDatasets('derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments', startTime, endTime);
};

/**
 * Gets steps for the signed in user during the given time period.
 *
 * @param{Date} startTime the start time for the period to get steps
 * @param{Date} endTime the end time for the period to get steps
 * @return {Object} a Google Fit steps API JSON response.
*/
GoogleFit.prototype.getSteps = function(startTime, endTime) {
  return this._getDatasets('derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas', startTime, endTime);
};

/**
 * Gets weight for the signed in user during the given time period.
 *
 * @param{Date} startTime the start time for the period to get weight 
 * @param{Date} endTime the end time for the period to get weight 
 * @return {Object} a Google Fit weight API JSON response.
*/
GoogleFit.prototype.getWeight = function(startTime, endTime) {
  return this._getDatasets('derived:com.google.weight:com.google.android.gms:merge_weight', startTime, endTime);
};

GoogleFit.prototype._getDatasets = function(dataSource, startTime, endTime) {
  // TODO: Implement paging using pageToken
  //       See: https://developers.google.com/fit/rest/v1/reference/users/dataSources/datasets/get
  var service = this.getService();

  // The Google Fit API takes timestamps in nanoseconds so we must convert milliseconds
  // returned by Date.getTime() to nanoseconds.
  var nanoSecondsPerMillisecond = 1000000;
  var uri = 'https://www.googleapis.com/fitness/v1/users/me/dataSources/' + dataSource + '/datasets/' + (startTime.getTime() * nanoSecondsPerMillisecond) + '-' + (endTime.getTime() * nanoSecondsPerMillisecond);
  return JSON.parse(UrlFetchApp.fetch(uri, {
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  }));
};
