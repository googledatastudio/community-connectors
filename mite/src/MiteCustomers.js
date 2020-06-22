var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Datastudio connector for the Mite customers API.
 *
 * @constructor
 * @returns {MiteCustomers} the connector wrapper for the Mite API
 */
function MiteCustomers() {
  return this;
}

/** @constant API for active customers; the relative path for the dedicated Mite API to call */
MiteCustomers.API = "customers";

/** @constant API_ARCHIVED for archived customers; the relative path for the dedicated Mite API to call */
MiteCustomers.API_ARCHIVED = "customers/archived";

/**
 * Created the wrapper that handles all Mite and connector functionalities since this instance handles the data schema only.
 *
 * @returns {MiteInterface} - the connector and Mite API wrapper
 */
MiteCustomers.prototype.createApi = function() {
  return new MiteInterface(
    this.getDimensions,
    undefined,
    "customer",
    MiteCustomers.API,
    MiteCustomers.API_ARCHIVED
  );
};

/**
 * Gets all dimensions supported by this Mite API.
 *
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteCustomers.prototype.getDimensions = function() {
  var types = cc.FieldType;

  return [
    {
      id: "id",
      name: "ID",
      type: types.NUMBER
    },
    {
      id: "name",
      name: "Name",
      filter: true,
      type: types.TEXT,
      isDefault: true
    },
    {
      id: "note",
      name: "Note",
      type: types.TEXT
    },
    {
      id: "hourly_rate",
      name: "Hourly Rate",
      type: types.NUMBER
    },
    {
      id: "archived",
      name: "Archived",
      filter: true,
      type: types.BOOLEAN
    }
  ];
};
