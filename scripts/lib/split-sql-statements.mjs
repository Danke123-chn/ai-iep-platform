/**
 * Split PostgreSQL SQL text into individual statements for ExecutePGSql (one per call).
 * Handles single-quoted strings, dollar-quoted blocks, and line comments.
 */
export function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let i = 0;
  let state = "normal";
  let dollarTag = "";

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (state === "line_comment") {
      current += ch;
      if (ch === "\n") state = "normal";
      i += 1;
      continue;
    }

    if (state === "single_quote") {
      current += ch;
      if (ch === "'") {
        if (next === "'") {
          current += next;
          i += 2;
          continue;
        }
        state = "normal";
      }
      i += 1;
      continue;
    }

    if (state === "dollar_quote") {
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length;
        state = "normal";
        dollarTag = "";
        continue;
      }
      current += ch;
      i += 1;
      continue;
    }

    if (ch === "-" && next === "-") {
      state = "line_comment";
      current += ch;
      i += 1;
      continue;
    }

    if (ch === "'") {
      state = "single_quote";
      current += ch;
      i += 1;
      continue;
    }

    if (ch === "$") {
      const match = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (match) {
        dollarTag = match[0];
        state = "dollar_quote";
        current += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }

    if (ch === ";") {
      const trimmed = current.trim();
      if (trimmed && !isCommentOnly(trimmed)) {
        statements.push(trimmed);
      }
      current = "";
      i += 1;
      continue;
    }

    current += ch;
    i += 1;
  }

  const trimmed = current.trim();
  if (trimmed && !isCommentOnly(trimmed)) {
    statements.push(trimmed);
  }

  return statements;
}

function isCommentOnly(text) {
  return text
    .split(/\r?\n/)
    .every((line) => /^\s*(--.*)?$/.test(line));
}
