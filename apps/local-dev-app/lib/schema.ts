import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export let domains = sqliteTable("local_domains", {
  id: integer("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  port: integer("port").notNull().unique(),
  note: text("note"),
});
