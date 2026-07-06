import { executePgSql, parsePgRows } from "./cloudbase-client.mjs";

function keyParts(values) {
  return values.join("|");
}

export async function buildReferenceIdMaps(clientBundle, referenceTables) {
  const maps = {};

  maps.milestone_id = buildMapFromExportAndCloudBase(
    referenceTables.vb_mapp_milestones ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, domain, level, milestone_number FROM public.vb_mapp_milestones",
      ),
    ),
    (row) => keyParts([row.domain, row.level, row.milestone_number]),
    (row) => keyParts([row[1], row[2], row[3]]),
  );

  maps.barrier_id = buildMapFromExportAndCloudBase(
    referenceTables.vb_mapp_barriers ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, barrier_name FROM public.vb_mapp_barriers",
      ),
    ),
    (row) => row.barrier_name,
    (row) => row[1],
  );

  maps.transition_id = buildMapFromExportAndCloudBase(
    referenceTables.vb_mapp_transitions ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, transition_name FROM public.vb_mapp_transitions",
      ),
    ),
    (row) => row.transition_name,
    (row) => row[1],
  );

  maps.cpep3_dev_item_id = buildMapFromExportAndCloudBase(
    referenceTables.c_pep3_developmental_items ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, domain, item_number FROM public.c_pep3_developmental_items",
      ),
    ),
    (row) => keyParts([row.domain, row.item_number]),
    (row) => keyParts([row[1], row[2]]),
  );

  maps.cpep3_pat_item_id = buildMapFromExportAndCloudBase(
    referenceTables.c_pep3_pathological_items ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, domain, item_number FROM public.c_pep3_pathological_items",
      ),
    ),
    (row) => keyParts([row.domain, row.item_number]),
    (row) => keyParts([row[1], row[2]]),
  );

  maps.kg_item_id = buildMapFromExportAndCloudBase(
    referenceTables.kg_integration_items ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, section, item_number FROM public.kg_integration_items",
      ),
    ),
    (row) => keyParts([row.section, row.item_number]),
    (row) => keyParts([row[1], row[2]]),
  );

  maps.elem_item_id = buildMapFromExportAndCloudBase(
    referenceTables.elem_integration_items ?? [],
    parsePgRows(
      await executePgSql(
        clientBundle,
        "SELECT id, section, item_number FROM public.elem_integration_items",
      ),
    ),
    (row) => keyParts([row.section, row.item_number]),
    (row) => keyParts([row[1], row[2]]),
  );

  return maps;
}

function buildMapFromExportAndCloudBase(
  exportRows,
  cloudbaseRows,
  exportKey,
  cloudbaseKey,
) {
  const cloudbaseByKey = new Map(
    cloudbaseRows.map((row) => [cloudbaseKey(row), row[0]]),
  );
  const map = new Map();
  for (const row of exportRows) {
    const key = exportKey(row);
    const newId = cloudbaseByKey.get(key);
    if (newId) map.set(row.id, newId);
  }
  return map;
}

export function remapForeignKeys(table, row, maps) {
  const next = { ...row };

  if (table === "vb_mapp_milestone_scores" && next.milestone_id) {
    next.milestone_id = maps.milestone_id.get(next.milestone_id) ?? next.milestone_id;
  }
  if (table === "vb_mapp_barrier_scores" && next.barrier_id) {
    next.barrier_id = maps.barrier_id.get(next.barrier_id) ?? next.barrier_id;
  }
  if (table === "vb_mapp_transition_scores" && next.transition_id) {
    next.transition_id = maps.transition_id.get(next.transition_id) ?? next.transition_id;
  }
  if (table === "c_pep3_developmental_scores" && next.item_id) {
    next.item_id = maps.cpep3_dev_item_id.get(next.item_id) ?? next.item_id;
  }
  if (table === "c_pep3_pathological_scores" && next.item_id) {
    next.item_id = maps.cpep3_pat_item_id.get(next.item_id) ?? next.item_id;
  }
  if (table === "kg_integration_scores" && next.item_id) {
    next.item_id = maps.kg_item_id.get(next.item_id) ?? next.item_id;
  }
  if (table === "elem_integration_scores" && next.item_id) {
    next.item_id = maps.elem_item_id.get(next.item_id) ?? next.item_id;
  }

  return next;
}
