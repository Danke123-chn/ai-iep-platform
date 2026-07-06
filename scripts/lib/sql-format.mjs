export function sqlLiteral(value, columnType) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NULL";
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (columnType === "jsonb") return "'[]'::jsonb";
      return "ARRAY[]::text[]";
    }
    if (typeof value[0] === "object") {
      return `'${escapeSqlString(JSON.stringify(value))}'::jsonb`;
    }
    return `ARRAY[${value.map((item) => sqlLiteral(String(item))).join(", ")}]::text[]`;
  }
  if (typeof value === "object") {
    return `'${escapeSqlString(JSON.stringify(value))}'::jsonb`;
  }
  return `'${escapeSqlString(String(value))}'`;
}

export function escapeSqlString(value) {
  return value.replace(/'/g, "''");
}

export function buildInsert(table, rows, columns, columnTypes = {}) {
  if (rows.length === 0) return null;
  const columnList = columns.map((c) => `"${c}"`).join(", ");
  const valuesList = rows
    .map((row) => {
      const values = columns.map((column) =>
        sqlLiteral(row[column] ?? null, columnTypes[column]),
      );
      return `(${values.join(", ")})`;
    })
    .join(",\n");
  return `INSERT INTO public.${table} (${columnList}) VALUES\n${valuesList}\nON CONFLICT DO NOTHING`;
}
