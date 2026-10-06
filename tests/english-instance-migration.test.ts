import { expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { readFileSync, readdirSync } from "node:fs";

test("an existing database gains English presets without restoring deleted data or overwriting edits", () => {
  const db = new Database(":memory:");
  for (const name of readdirSync("migrations").sort().filter((name) => name.endsWith(".sql") && name < "0060")) {
    db.exec(readFileSync(`migrations/${name}`, "utf8"));
  }
  db.exec("UPDATE notebooks SET name = 'My custom notebook' WHERE id = 'nb_projects'");
  db.exec("DELETE FROM memo_templates WHERE id LIKE '%_template_reading%'");
  db.exec("UPDATE memo_templates SET name = 'My template', updated_at = '2099' WHERE id LIKE '%_template_meeting%'");
  const migration = readFileSync("migrations/0060_english_instance_defaults.sql", "utf8");
  db.exec(migration);
  const rows = db.query("SELECT name FROM memo_templates").all();
  expect(rows.some((row: any) => row.name === 'My template')).toBe(true);
  expect(rows.filter((row: any) => row.name !== 'My template').every((row: any) => !/\p{Script=Han}/u.test(row.name))).toBe(true);
  expect(db.query("SELECT name FROM notebooks WHERE id = 'nb_projects'").get()).toEqual({name: 'My custom notebook'});
  expect(db.query("SELECT name FROM notebooks WHERE id = 'nb_inbox'").get()).toEqual({name: 'Inbox'});
  expect(db.query("SELECT title FROM memos WHERE id = 'memo_welcome'").get()).toEqual({title: 'Welcome to EdgeEver'});
  expect(db.query("SELECT COUNT(*) AS count FROM memo_templates WHERE id LIKE '%_template_reading%'").get()).toEqual({count: 0});
  db.exec(migration);
  expect(db.query("SELECT COUNT(*) AS count FROM memo_templates").get()).toEqual({count: rows.length});
  db.close();
});
