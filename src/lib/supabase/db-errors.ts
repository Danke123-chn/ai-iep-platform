export function getDbErrorMessage(message: string): string {
  if (message.includes("null value in column")) {
    const nullMatch = message.match(
      /null value in column "([^"]+)" of relation "([^"]+)"/,
    );
    if (nullMatch) {
      const [, column, table] = nullMatch;
      if (table === "ieps" && column === "academic_year") {
        return "数据库 ieps 表使用了旧列名 academic_year，与程序不一致。请在 Supabase SQL Editor 执行 006_rename_ieps_columns.sql 中的 SQL 修复。";
      }
      if (table === "iep_goals" && column === "domain") {
        return "数据库 iep_goals 表使用了旧列名 domain，与程序不一致。请在 Supabase SQL Editor 执行 007_rename_iep_goals_columns.sql 中的 SQL 修复。";
      }
      return `保存失败：${table} 表的「${column}」字段不能为空。请检查数据库表结构是否与项目 migration 一致。`;
    }
  }

  const columnMatch = message.match(
    /Could not find the '([^']+)' column of '([^']+)'/,
  );

  if (columnMatch) {
    const [, column, table] = columnMatch;
    if (table === "ieps") {
      return `数据库 ieps 表缺少「${column}」字段。请在 Supabase → SQL Editor 中执行修复 SQL（见项目 supabase/migrations/005_fix_ieps_schema.sql），然后重试。`;
    }
    if (table === "students") {
      return `数据库 students 表缺少「${column}」字段。请在 Supabase → SQL Editor 中执行修复 SQL（见项目 supabase/migrations/004_fix_students_schema.sql），然后重试。`;
    }
    if (table === "assessment_sessions") {
      return `数据库缺少 assessment_sessions 表或字段「${column}」。请在 Supabase SQL Editor 执行 supabase/migrations/009_assessment_sessions.sql 中的 SQL。`;
    }
    return `数据库 ${table} 表缺少「${column}」字段。请执行最新 migration SQL 后重试。`;
  }

  if (message.includes("schema cache")) {
    return "数据库结构未同步。请在 Supabase SQL Editor 执行最新 migration，或到 Project Settings → API 点击 Reload schema。";
  }

  return message;
}
