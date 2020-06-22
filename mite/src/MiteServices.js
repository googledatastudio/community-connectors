var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Datastudio connector for the Mite services API.
 *
 * @constructor
 * @returns {MiteServices} the connector wrapper for the Mite API
 */
function MiteServices() {
  return this;
}

/** @constant API for active services; the relative path for the dedicated Mite API to call */
MiteServices.API = "services";

/** @constant API_ARCHIVED for archived services; the relative path for the dedicated Mite API to call */
MiteServices.API_ARCHIVED = "services/archived";

/**
 * Created the wrapper that handles all Mite and connector functionalities since this instance handles the data schema only.
 *
 * @returns {MiteInterface} - the connector and Mite API wrapper
 */
MiteServices.prototype.createApi = function() {
  return new MiteInterface(
    this.getDimensions,
    undefined,
    "service",
    MiteServices.API,
    MiteServices.API_ARCHIVED
  );
};

/**
 * Gets all dimensions supported by this Mite API.
 *
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteServices.prototype.getDimensions = function() {
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
      isDefault: true,
      type: types.TEXT
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
      id: "billable",
      name: "Billable",
      filter: true,
      type: types.BOOLEAN
    },
    {
      id: "archived",
      name: "Archived",
      filter: true,
      type: types.BOOLEAN
    }
  ];
};
