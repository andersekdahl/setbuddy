import SQLite from 'react-native-sqlite-storage';

export async function open() {
  const db = await SQLite.openDatabase({ name: 'setbuddy', location: 'default' });
  return db;
}

export async function select(sql: string, params: any[], db?: SQLite.SQLiteDatabase | SQLite.Transaction) {
  if (!db) {
    db = await open();
  }

  const results = await db.executeSql(sql, params);
  const result = results.length === 1 ? results[0] : results[1];

  const rows = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }
  return rows;
}

type MigrationFunction = (db: SQLite.SQLiteDatabase) => Promise<unknown>;
const migrations: { [name: string]: MigrationFunction } = {};

export async function migrateIfNeeded() {
  const db = await open();
  await db.executeSql('CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, executed_at INTEGER)');
  const results = (await db.executeSql('SELECT name FROM migrations'))[0];
  const previouslyExecutedMigrations = [];
  for (let i = 0; i < results.rows.length; i++) {
    previouslyExecutedMigrations.push(results.rows.item(i));
  }

  for (const migrationName of Object.keys(migrations)) {
    if (previouslyExecutedMigrations.indexOf(migrationName) === -1) {
      await migrations[migrationName](db);
      await db.executeSql('INSERT INTO migrations (name, executed_at) VALUES(?, ?)', [
        migrationName,
        new Date().valueOf(),
      ]);
    }
  }
}

export function registerMigration(date: number, name: string, migration: MigrationFunction) {
  migrations[date + '_' + name] = migration;
}
