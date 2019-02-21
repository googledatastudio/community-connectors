/**
 * Declares class Fields.
 */
var Fields = function() {
 this.cc;
 this.fields;
 this.types;
 this.aggregations;

 this.init = function() {
  this.cc = DataStudioApp.createCommunityConnector();
  this.fields = this.cc.getFields();
  this.types = this.cc.FieldType;
  this.aggregations = this.cc.AggregationType;
 };

 this.createNewMetric = function(obj) {
  var metric = this.fields.newMetric();
  metric.setId(obj.id);
  metric.setName(obj.name);
  metric.setType(this.types[obj.type]);
  metric.setDescription(obj.description);
  metric.setGroup(obj.group);
 };

 this.createnewDimension = function(obj) {
  var dimension = this.fields.newDimension();
  dimension.setId(obj.id);
  dimension.setName(obj.name);
  dimension.setDescription(obj.description);
  dimension.setGroup(obj.group);
  dimension.setType(this.types[obj.type]);
 };

 this.createFields = function(data) {
  var self = this;
  data.forEach(function(item) {
   if (item.category === 'metric') {
    self.createNewMetric(item);
   } else {
    self.createnewDimension(item);
   }
  });
 };

 this.build = function() {
  return this.fields;
 };
};
/**
 * Returns the fields for the connector.
 *
 * @returns {Object} The fields for the connector.
 */
function getSerpstatFields(method) {
 var serpstatInfo = serpstatAPI.fetchDataFromNode(
  method === 'competitors'
   ? 'fieldsForCompetitors'
   : 'fieldsForHistory'
 );

 var serpstatFields = new Fields();
 serpstatFields.init();

 serpstatFields.createFields(serpstatInfo);
 return serpstatFields.build();
}
