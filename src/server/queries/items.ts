import { ItemDataType } from './items.model';

export const createNewItem = (scenarioId, startTime, environment, note, status) => {
  return {
    text: `INSERT INTO jtl.items(scenario_id, start_time, environment, note, status) VALUES(
      (SELECT id FROM jtl.scenario WHERE name = $1), $2, $3, $4, $5) RETURNING id`,
    values: [scenarioId, startTime, environment, note, status]
  };
};

export const saveKpiData = (itemId, data) => {
  return {
    text: 'INSERT INTO jtl.data(item_id, item_data, data_type) VALUES($1, $2, $3)',
    values: [itemId, data, ItemDataType.Kpi]
  };
};

export const savePlotData = (itemId, data) => {
  return {
    text: 'INSERT INTO jtl.charts(item_id, plot_data) VALUES($1, $2)',
    values: [itemId, data]
  };
};

export const findItem = (itemId, projectName, scenarioName) => {
  return {
    text: `SELECT charts.plot_data, note, environment, status, (SELECT items.id FROM jtl.items as items
      LEFT JOIN jtl.charts as charts ON charts.item_id = items.id
      LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE s.name = $3
      AND p.project_name = $2
      AND base is not null) as base_id
    FROM jtl.items as items
    LEFT JOIN jtl.charts as charts ON charts.item_id = items.id
    LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE items.id = $1
    AND p.project_name = $2
    AND s.name = $3;`,
    values: [itemId, projectName, scenarioName]
  };
};

export const findItemStats = (testItem) => {
  return {
    text: 'SELECT stats, overview FROM jtl.item_stat WHERE item_id = $1',
    values: [testItem]
  };
};

export const updateNote = (itemId, projectName, note) => {
  return {
    text: 'UPDATE jtl.items SET note = $3 WHERE id = $1 AND project_id = $2;',
    values: [itemId, projectName, note]
  };
};

export const saveItemStats = (itemId, stats, overview) => {
  return {
    text: 'INSERT INTO jtl.item_stat(item_id, stats, overview) VALUES($1, $2, $3);',
    values: [itemId, stats, overview]
  };
};

export const updateTestItemInfo = (itemId, scenarioName, projectName, note, environment) => {
  return {
    text: `UPDATE jtl.items as it
    SET note = $3, environment = $4
    FROM jtl.scenario as s
    WHERE it.id = $1
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $2)
    AND s.name = $5`,
    values: [itemId, projectName, note, environment, scenarioName]
  };
};

export const deleteItem = (projectName, scenarioName, itemId) => {
  return {
    text: `DELETE FROM jtl.items as it
    USING jtl.scenario as s
    WHERE it.id = $1
    AND s.name = $2
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $3)`,
    values: [itemId, scenarioName, projectName]
  };
};

export const saveErrorsData = (itemId, data) => {
  return {
    text: 'INSERT INTO jtl.data(item_id, item_data, data_type) VALUES($1, $2, $3)',
    values: [itemId, data, ItemDataType.Error]
  };
};


export const findErrors = (itemId, projectName) => {
  return {
    text: `SELECT item_data as errors FROM jtl.items as items
    LEFT JOIN jtl.data as data ON data.item_id = items.id
    LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE items.id = $1
    AND p.project_name = $2
    AND data_type = $3`,
    values: [itemId, projectName, ItemDataType.Error]
  };
};

export const findAttachements = itemId => {
  return {
    text: `SELECT d.data_type as type FROM jtl.data d
    WHERE d.item_id = $1
    AND d.data_type != $2;`,
    values: [itemId, ItemDataType.Kpi]
  };
};

export const removeCurrentBaseFlag = (scenarioName) => {
  return {
    text: `UPDATE jtl.items SET base = NULL
    WHERE base
    AND scenario_id = (SELECT id FROM jtl.scenario WHERE name = $1);`,
    values: [scenarioName]
  };
};

export const setBaseFlag = (itemId, scenarioName) => {
  return {
    text: `UPDATE jtl.items SET base = TRUE
    WHERE id = $1
    AND scenario_id = (SELECT id FROM jtl.scenario WHERE name = $2);`,
    values: [itemId, scenarioName]
  };
};

export const dashboardStats = () => {
  return {
    text: `
    SELECT round(AVG((overview -> 'maxVu')::int)) as "avgVu",
    round(AVG((overview -> 'duration')::int)) as "avgDuration",
    round(SUM((overview -> 'duration')::int)) as "totalDuration",
    count(*) as "totalCount" from jtl.item_stat;`
  };
};
