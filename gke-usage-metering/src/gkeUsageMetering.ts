namespace gkeUsageMetering {
  /** @const */

  export function getSchema(request) {
    var cc = DataStudioApp.createCommunityConnector();
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields
      .newDimension()
      .setId('cluster_location')
      .setDescription('The GCP region/zone in which the GKE cluster resides')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setId('cluster_name')
      .setDescription('The name of the GKE cluster')
      .setType(types.TEXT)

    fields
      .newDimension()
      .setId('namespace')
      .setDescription('The Kubernetes namespace')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setId('resource_name')
      .setDescription('The name of the resource, which maps to a key in Kubernetes\' ResourceList (e.g., cpu and memory')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setId('resource_name_with_type_and_unit')
      .setDescription('The resource name with remark on the type and unit')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setId('sku_id')
      .setDescription('The SKU ID of the underlying GCP cloud resource')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setId('usage_end_time')
      .setDescription('The UNIX timestamp of when the usage ended')
      .setType(types.YEAR_MONTH_DAY);

    fields
      .newDimension()
      .setId('usage_start_time')
      .setDescription('The UNIX timestamp of when the usage began')
      .setType(types.YEAR_MONTH_DAY);

    fields
    .newMetric()
    .setAggregation(aggregations.SUM)
    .setDescription('The usage amount')
    .setId('amount')
    .setType(types.NUMBER);

    fields
    .newMetric()
    .setAggregation(aggregations.SUM)
    .setDescription('The usage amount in pricing unit')
    .setId('amount_in_pricing_units')
    .setType(types.NUMBER);

    fields
      .newMetric()
      .setAggregation(aggregations.SUM)
      .setDescription('The allocated cost')
      .setId('cost')
      .setType(types.NUMBER);

    fields
    .newMetric()
    .setAggregation(aggregations.SUM)
    .setDescription('The request-based cost including allocated, unallocated, and untracked')
    .setId('cost_with_unallocated_untracked')
    .setType(types.NUMBER);

    fields
    .newDimension()
    .setDescription('The type of usage metering: request-based or consumption-based')
    .setId('type')
    .setType(types.TEXT);

    fields
      .newDimension()
      .setDescription('The key of a Kubernetes label')
      .setId('labels.key')
      .setType(types.TEXT);

    fields
      .newDimension()
      .setDescription('The value of Kubernetes label')
      .setId('labels.value')
      .setType(types.TEXT);

    var schema = fields.build();

    schema.forEach(function (field: any) {
      if (field.name === 'labels.key') {
        field.ancestors = [
          {
            name: 'labels',
            isRepeated: true,
          }, {
            name: 'key',
            isRepeated: false,
          }
        ];
      } else if (field.name === 'labels.value') {
        field.ancestors = [
          {
            name: 'labels',
            isRepeated: true
          },
          {
            name: 'value',
            isRepeated: false
          }
        ];
      }
    });
    return {schema: schema};
  }

  /**
   * Validates config parameters.
   */
  export function validateConfig(connector, configParams) {
    let fullResourceUsageDataset = (configParams && configParams.resourceUsageDatasetID);
    if (!fullResourceUsageDataset) {
      return connector
        .newUserError()
        .setText('The resource usage dataset ID is not specified')
        .throwException();
    }
    // GCP project name can contain letters, numbers, single quotes, 
    // hyphens, spaces or exclamation points; BigQuery dataset IDs can contain
    // letters, numbers and underscores
    if (!fullResourceUsageDataset.match(/^[a-zA-z-_\d' !]+\.[a-zA-z_\d]+$/)) {
      return connector
        .newUserError()
        .setText('Invalid resource usage dataset ID: dataset ID must be in the format of \"${PROJECT_ID}.${DATASET_ID}\}"')
        .throwException();
    }

    let fullBillingTable = (configParams && configParams.gcpBillingExportTableID);
    if (!fullBillingTable) {
      return connector
        .newUserError()
        .setText('The GCP billing table ID is not specified')
        .throwException();
    }
    // Bigquery table IDs can contain letters, numbers and underscores
    if (!fullBillingTable.match(/^[a-zA-z-_\d' !]+\.[a-zA-z_\d]+\.[a-zA-z_\d]+$/)) {
      return connector
        .newUserError()
        .setText('Invalid GCP billing table ID: table ID must be in the format of \"${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\"')
        .throwException();
    }
  };
};
