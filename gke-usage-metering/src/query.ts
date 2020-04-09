namespace gkeUsageMetering {
  const requestTableID = 'gke_cluster_resource_usage_partitioned';
  const consumptionTableID = 'gke_cluster_resource_consumption';

  /**
   * Returns the BigQuery query based on whether consumption-based metering
   * is enabled or not
   * @param gcpBillingExportTableID
   * @param usageExportDatasetID
   * @param startDate
   * @param endDate
   * @param consumptionEnabled
   */
  export function generateSQLQuery(
    gcpBillingExportTableID: string,
    usageExportDatasetID: string,
    startDate: string,
    endDate: string,
    consumptionEnabled: boolean,
  ): string {

    let fullGCPBillingExportTableID = gcpBillingExportTableID.replace(":", ".");
    let fullUsageExportTableID = usageExportDatasetID.replace(":", ".") + "." + requestTableID;
    let fullConsumptionUsageExportTableID = usageExportDatasetID.replace(":", ".") + "." + consumptionTableID;
    let projectID = fullUsageExportTableID.split(".")[0]

    let queryWithRequestOnly = `
    WITH billing_table AS (
      SELECT
        sku_id,
        project_id,
        MIN(min_usage_start_time) AS min_usage_start_time,
        MAX(max_usage_end_time) AS max_usage_end_time,
        SUM(amount) AS amount,
        usage_unit AS usage_unit,
        SUM(cost) AS cost,
        SUM(cost) / SUM(rate) AS rate
      FROM
        \`${fullGCPBillingExportTableID}\`
      WHERE
        min_usage_start_time >= TIMESTAMP("${startDate}")
        AND max_usage_end_time <= TIMESTAMP("${endDate}")
        AND project_id = "${projectID}"
      GROUP BY
        project_id,
        sku_id,
        usage_unit  ) ,
   -- Select from the raw resource usage table the resource usage records
   -- incurred in the given time interval.
  filtered_resource_usage AS (
      SELECT
            resource_usage.cluster_location,
            resource_usage.cluster_name,
            resource_usage.end_time,
            resource_usage.labels,
            resource_usage.namespace,
            resource_usage.project_id AS project_id,
            resource_usage.resource_name,
            resource_usage.sku_id,
            resource_usage.start_time,
            resource_usage.amount AS amount,
            amount_with_untracked as amount_with_untracked,
            billing_table.rate
      FROM ( 
              SELECT 
                  *
              FROM 
                \`${fullUsageExportTableID}\`
              WHERE
                      resource_usage.start_time >= DATE("${startDate}")
                AND resource_usage.end_time <= DATE("${endDate}")  
        ) AS resource_usage
      INNER JOIN
        billing_table
      ON
        resource_usage.sku_id = billing_table.sku_id
        AND resource_usage.project_id = billing_table.project_id
        AND resource_usage.end_time <= billing_table.max_usage_end_time
        AND resource_usage.start_time >= billing_table.min_usage_start_time
  ),
     aggregated_resource_usage AS (
      SELECT
        project_id,
        sku_id,
        resource_name,
        SUM(amount) AS amount
      FROM
        filtered_resource_usage
      GROUP BY
        project_id,
        resource_name,
        sku_id ),
      -- Calculate the total amount of untracked resources. These include unused
      -- resources in a GKE cluster (i.e., free CPU cycles and RAM blocks in a GKE
      -- node), and non-GKE resources.
      untracked_resource_usage AS (
      SELECT
        STRING(NULL) AS cluster_location,
        STRING(NULL) AS cluster_name,
        billing_table.max_usage_end_time AS end_time,
        ARRAY<STRUCT<key STRING, value STRING>>[] AS labels,
        "unallocated" AS namespace,
        billing_table.project_id,
        aggregated_resource_usage.resource_name,
        billing_table.sku_id,
        billing_table.min_usage_start_time AS start_time,
        billing_table.amount - IFNULL(aggregated_resource_usage.amount, 0.0) AS amount,
        NULL AS amount_with_untracked,
        billing_table.rate
      FROM
        billing_table
      LEFT JOIN
        aggregated_resource_usage
      ON
        billing_table.sku_id = aggregated_resource_usage.sku_id
        ),
      -- Generate a table that contains the usage amount of each unallocated resource_name
      breakdown_untracked_resource_usage AS (
        SELECT
          untracked_resource_usage.resource_name,
          SUM(amount) AS amount
        FROM
          untracked_resource_usage
        GROUP BY
          untracked_resource_usage.resource_name
      ),
      -- Add breakdown_untracked_resource_usage to filtered_resource_usage and form a new table
      aggregated_resource_usage_by_resource_name AS (
        SELECT
          filtered_resource_usage.resource_name,
          SUM(filtered_resource_usage.amount) AS amount
        FROM
          filtered_resource_usage
        GROUP BY
          filtered_resource_usage.resource_name
      ),
      -- Allocate unused, but allocated, amount of resources to each SKU
      filtered_resource_usage_with_unused AS (
        SELECT
          filtered_resource_usage.cluster_location,
          filtered_resource_usage.cluster_name,
          filtered_resource_usage.end_time,
          filtered_resource_usage.labels,
          filtered_resource_usage.namespace,
          filtered_resource_usage.project_id,
          filtered_resource_usage.resource_name,
          filtered_resource_usage.sku_id,
          filtered_resource_usage.start_time,
          filtered_resource_usage.amount,
          (filtered_resource_usage.amount / aggregated_resource_usage_by_resource_name.amount) * breakdown_untracked_resource_usage.amount AS allocate_unused,
          filtered_resource_usage.rate
        FROM
          filtered_resource_usage
        INNER JOIN
          aggregated_resource_usage_by_resource_name
        ON
          filtered_resource_usage.resource_name = aggregated_resource_usage_by_resource_name.resource_name
        INNER JOIN
          breakdown_untracked_resource_usage
        ON
          filtered_resource_usage.resource_name = breakdown_untracked_resource_usage.resource_name
      ),
      -- Get the total usage amount by the project in the GCP cluster
      total_used AS (
        SELECT
          resource_usage.resource_name,
          SUM(billing_table.amount) AS amount
        FROM
          billing_table
        INNER JOIN
          ( 
              SELECT 
                  resource_name
                  , project_id
                  , start_time
                  , end_time
              FROM 
                  \`${fullUsageExportTableID}\` 
              WHERE
                    start_time >= DATE("${startDate}") 
                    AND end_time <= DATE("${endDate}")     
        ) AS resource_usage 
        ON
          resource_usage.project_id = billing_table.project_id
          AND resource_usage.end_time <= billing_table.max_usage_end_time
          AND resource_usage.start_time >= billing_table.min_usage_start_time
        GROUP BY
          resource_usage.resource_name
      ),
      -- Get the total unallocated usage amount
      unallocated_usage AS (
        SELECT
          untracked_resource_usage.resource_name,
          SUM(untracked_resource_usage.amount) AS amount
        FROM
          untracked_resource_usage
        WHERE
          untracked_resource_usage.namespace = "unallocated"
        GROUP BY
          untracked_resource_usage.resource_name
      ),
      -- Spread the unallocated usage amount to each SKU
      filtered_resource_usage_with_unused_and_unallocated AS (
        SELECT
          filtered_resource_usage_with_unused.cluster_location,
          filtered_resource_usage_with_unused.cluster_name,
          filtered_resource_usage_with_unused.end_time,
          filtered_resource_usage_with_unused.labels,
          filtered_resource_usage_with_unused.namespace,
          filtered_resource_usage_with_unused.project_id,
          filtered_resource_usage_with_unused.resource_name,
          filtered_resource_usage_with_unused.sku_id,
          filtered_resource_usage_with_unused.start_time,
          filtered_resource_usage_with_unused.amount,
          filtered_resource_usage_with_unused.amount + filtered_resource_usage_with_unused.allocate_unused + unallocated_usage.amount * (filtered_resource_usage_with_unused.amount / total_used.amount) AS amount_with_untracked,
          filtered_resource_usage_with_unused.rate
        FROM
          filtered_resource_usage_with_unused
        INNER JOIN
          total_used
        ON
          total_used.resource_name = filtered_resource_usage_with_unused.resource_name
        INNER JOIN
          unallocated_usage
        ON unallocated_usage.resource_name = filtered_resource_usage_with_unused.resource_name
    
      ),
      -- Generate the cost breakdown table.
      request_based_cost_allocation AS (
      SELECT
        resource_usage.cluster_location,
        resource_usage.cluster_name,
        resource_usage.end_time AS usage_end_time,
        resource_usage.labels,
        resource_usage.namespace,
        resource_usage.resource_name,
        NULL AS resource_name_with_type_and_unit,
        resource_usage.sku_id,
        resource_usage.start_time AS usage_start_time,
        0 AS amount,
        resource_usage.amount * resource_usage.rate AS cost,
        resource_usage.amount_with_untracked * resource_usage.rate AS cost_with_unallocated_untracked,
        "request" AS type
      FROM (
        SELECT
          *
        FROM
          untracked_resource_usage
        UNION ALL
        SELECT
          *
        FROM
          filtered_resource_usage_with_unused_and_unallocated ) AS resource_usage
      )
    SELECT
      *
    FROM
      request_based_cost_allocation  
    `;

    let queryWithConsumptionEnabled = `
    WITH
    -- Select from the raw GCP billing export table the charges incurred in a
    -- given GCP project and in the given time interval.
    billing_table AS (
    SELECT
      sku.id AS sku_id,
      project.id AS project_id,
      MIN(usage_start_time) AS min_usage_start_time,
      MAX(usage_end_time) AS max_usage_end_time,
      SUM(usage.amount) AS amount,
      usage.unit AS usage_unit,
      SUM(cost) AS cost,
      SUM(cost) / SUM(usage.amount) AS rate
    FROM
      \`${fullGCPBillingExportTableID}\`
    WHERE
      usage_start_time >= TIMESTAMP("${startDate}")
      AND usage_end_time <= TIMESTAMP("${endDate}")
      AND project.id = "${projectID}"
    GROUP BY
      project.id,
      sku.id,
      usage.unit ),
    -- Select from the raw resource usage table the resource usage records
    -- incurred in the given time interval.
    filtered_resource_usage AS (
    SELECT
      resource_usage.cluster_location,
      resource_usage.cluster_name,
      resource_usage.end_time,
      resource_usage.labels,
      resource_usage.namespace,
      resource_usage.project.id AS project_id,
      resource_usage.resource_name,
      resource_usage.sku_id,
      resource_usage.start_time,
      resource_usage.usage.amount AS amount,
      NULL as amount_with_untracked,
      billing_table.rate
    FROM
      \`${fullUsageExportTableID}\` AS resource_usage
    INNER JOIN
      billing_table
    ON
      resource_usage.sku_id = billing_table.sku_id
      AND resource_usage.project.id = billing_table.project_id
      AND resource_usage.end_time <= billing_table.max_usage_end_time
      AND resource_usage.start_time >= billing_table.min_usage_start_time ),
    aggregated_resource_usage AS (
    SELECT
      project_id,
      sku_id,
      resource_name,
      SUM(amount) AS amount
    FROM
      filtered_resource_usage
    GROUP BY
      project_id,
      resource_name,
      sku_id ),
    -- Calculate the total amount of untracked resources. These include unused
    -- resources in a GKE cluster (i.e., free CPU cycles and RAM blocks in a GKE
    -- node), and non-GKE resources.
    untracked_resource_usage AS (
    SELECT
      STRING(NULL) AS cluster_location,
      STRING(NULL) AS cluster_name,
      billing_table.max_usage_end_time AS end_time,
      ARRAY<STRUCT<key STRING, value STRING>>[] AS labels,
      "unallocated" AS namespace,
      billing_table.project_id,
      aggregated_resource_usage.resource_name,
      billing_table.sku_id,
      billing_table.min_usage_start_time AS start_time,
      billing_table.amount - IFNULL(aggregated_resource_usage.amount, 0.0) AS amount,
      NULL AS amount_with_untracked,
      billing_table.rate
    FROM
      billing_table
    LEFT JOIN
      aggregated_resource_usage
    ON
      billing_table.sku_id = aggregated_resource_usage.sku_id
      ),
    -- Generate a table that contains the usage amount of each unallocated resource_name
    breakdown_untracked_resource_usage AS (
      SELECT
        untracked_resource_usage.resource_name,
        SUM(amount) AS amount
      FROM
        untracked_resource_usage
      GROUP BY
        untracked_resource_usage.resource_name
    ),
    -- Add breakdown_untracked_resource_usage to filtered_resource_usage and form a new table
    aggregated_resource_usage_by_resource_name AS (
      SELECT
        filtered_resource_usage.resource_name,
        SUM(filtered_resource_usage.amount) AS amount
      FROM
        filtered_resource_usage
      GROUP BY
        filtered_resource_usage.resource_name
    ),
    -- Allocate unused, but allocated, amount of resources to each SKU
    filtered_resource_usage_with_unused AS (
      SELECT
        filtered_resource_usage.cluster_location,
        filtered_resource_usage.cluster_name,
        filtered_resource_usage.end_time,
        filtered_resource_usage.labels,
        filtered_resource_usage.namespace,
        filtered_resource_usage.project_id,
        filtered_resource_usage.resource_name,
        filtered_resource_usage.sku_id,
        filtered_resource_usage.start_time,
        filtered_resource_usage.amount,
        (filtered_resource_usage.amount / aggregated_resource_usage_by_resource_name.amount) * breakdown_untracked_resource_usage.amount AS allocate_unused,
        filtered_resource_usage.rate
      FROM
        filtered_resource_usage
      INNER JOIN
        aggregated_resource_usage_by_resource_name
      ON
        filtered_resource_usage.resource_name = aggregated_resource_usage_by_resource_name.resource_name
      INNER JOIN
        breakdown_untracked_resource_usage
      ON
        filtered_resource_usage.resource_name = breakdown_untracked_resource_usage.resource_name
    ),
    -- Get the total usage amount by the project in the GCP cluster
    total_used AS (
      SELECT
        resource_usage.resource_name,
        SUM(billing_table.amount) AS amount
      FROM
        billing_table
      INNER JOIN
        \`${fullUsageExportTableID}\` AS resource_usage
      ON
        resource_usage.project.id = billing_table.project_id
        AND resource_usage.end_time <= billing_table.max_usage_end_time
        AND resource_usage.start_time >= billing_table.min_usage_start_time
      GROUP BY
        resource_usage.resource_name
    ),
    -- Get the total unallocated usage amount
    unallocated_usage AS (
      SELECT
        untracked_resource_usage.resource_name,
        SUM(untracked_resource_usage.amount) AS amount
      FROM
        untracked_resource_usage
      WHERE
        untracked_resource_usage.namespace = "unallocated"
      GROUP BY
        untracked_resource_usage.resource_name
    ),
    -- Spread the unallocated usage amount to each SKU
    filtered_resource_usage_with_unused_and_unallocated AS (
      SELECT
        filtered_resource_usage_with_unused.cluster_location,
        filtered_resource_usage_with_unused.cluster_name,
        filtered_resource_usage_with_unused.end_time,
        filtered_resource_usage_with_unused.labels,
        filtered_resource_usage_with_unused.namespace,
        filtered_resource_usage_with_unused.project_id,
        filtered_resource_usage_with_unused.resource_name,
        filtered_resource_usage_with_unused.sku_id,
        filtered_resource_usage_with_unused.start_time,
        filtered_resource_usage_with_unused.amount,
        filtered_resource_usage_with_unused.amount + filtered_resource_usage_with_unused.allocate_unused + unallocated_usage.amount * (filtered_resource_usage_with_unused.amount / total_used.amount) AS amount_with_untracked,
        filtered_resource_usage_with_unused.rate
      FROM
        filtered_resource_usage_with_unused
      INNER JOIN
        total_used
      ON
        total_used.resource_name = filtered_resource_usage_with_unused.resource_name
      INNER JOIN
        unallocated_usage
      ON unallocated_usage.resource_name = filtered_resource_usage_with_unused.resource_name
  
    ),
    -- Generate the cost breakdown table.
    request_based_cost_allocation AS (
    SELECT
      resource_usage.cluster_location,
      resource_usage.cluster_name,
      FORMAT_TIMESTAMP('%Y%m%d', resource_usage.end_time) AS usage_end_time,
      resource_usage.labels,
      resource_usage.namespace,
      resource_usage.resource_name,
      CASE
        WHEN resource_name = 'cpu' THEN 'CPU requested (CPU hour)'
        WHEN resource_name = 'memory' THEN 'memory requested (GB hour)'
      END
      AS resource_name_with_type_and_unit,
      resource_usage.sku_id,
      FORMAT_TIMESTAMP('%Y%m%d', resource_usage.start_time) AS usage_start_time,
      CASE
        WHEN resource_name = 'cpu' THEN amount/3600
        WHEN resource_name = 'memory' THEN amount/(3600*POW(2,30))
      END
      AS amount,
      resource_usage.amount * resource_usage.rate AS cost,
      resource_usage.amount_with_untracked * resource_usage.rate AS cost_with_unallocated_untracked,
      "request" AS type
    FROM (
      SELECT
        *
      FROM
        untracked_resource_usage
      UNION ALL
      SELECT
        *
      FROM
        filtered_resource_usage_with_unused_and_unallocated ) AS resource_usage
    ),
    consumption_based_cost_allocation AS (
        WITH
          filtered_resource_usage AS (
          SELECT
            resource_usage.cluster_location,
            resource_usage.cluster_name,
            resource_usage.end_time,
            resource_usage.labels,
            resource_usage.namespace,
            resource_usage.project.id AS project_id,
            resource_usage.resource_name,
            resource_usage.sku_id,
            resource_usage.start_time,
            resource_usage.usage.amount AS amount,
            billing_table.rate
          FROM
            \`${fullConsumptionUsageExportTableID}\` AS resource_usage
          INNER JOIN
            billing_table
          ON
            resource_usage.sku_id = billing_table.sku_id
            AND resource_usage.project.id = billing_table.project_id
            AND resource_usage.end_time <= billing_table.max_usage_end_time
            AND resource_usage.start_time >= billing_table.min_usage_start_time ),
          -- Generate the total amount of resources tracked in the
          -- \`filtered_resource_usage\` table.
          aggregated_resource_usage AS (
          SELECT
            project_id,
            sku_id,
            resource_name,
            SUM(amount) AS amount
          FROM
            filtered_resource_usage
          GROUP BY
            project_id,
            resource_name,
            sku_id ),
          -- Generate the cost breakdown table.
          cost_allocation AS (
          SELECT
            filtered_resource_usage.cluster_location,
            filtered_resource_usage.cluster_name,
            FORMAT_TIMESTAMP('%Y%m%d', filtered_resource_usage.end_time) AS usage_end_time,
            filtered_resource_usage.labels,
            filtered_resource_usage.namespace,
            filtered_resource_usage.resource_name,
            CASE
              WHEN resource_name = 'cpu' THEN 'CPU consumed (CPU hour)'
              WHEN resource_name = 'memory' THEN 'memory consumed (GB hour)'
            END
            AS resource_name_with_type_and_unit,
            filtered_resource_usage.sku_id,
            FORMAT_TIMESTAMP('%Y%m%d', filtered_resource_usage.start_time) AS usage_start_time,
            CASE
              WHEN resource_name = 'cpu' THEN amount/3600
              WHEN resource_name = 'memory' THEN amount/(3600*POW(2,30))
              END
            AS amount,
            filtered_resource_usage.amount * filtered_resource_usage.rate AS cost,
            0 AS cost_with_unallocated_untracked,
            "consumption" AS type
          FROM filtered_resource_usage
          )
        SELECT
          *
        FROM
          cost_allocation
      )
  SELECT
    *
  FROM
    request_based_cost_allocation
  UNION ALL
  SELECT
    *
  FROM
    consumption_based_cost_allocation
    `;
    if (consumptionEnabled) {
      return queryWithConsumptionEnabled
    }
    return queryWithRequestOnly
  }
}
