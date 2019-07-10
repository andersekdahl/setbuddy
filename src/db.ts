import SQLite from 'react-native-sqlite-storage';

let db: SQLite.SQLiteDatabase;

export async function open() {
  if (!db) {
    db = await SQLite.openDatabase({ name: 'setbuddy', location: 'default' });
  }
  return db;
}

export async function executeSql(sql: string, params: any[]): Promise<SQLite.ResultSet> {
  const db = await open();
  return new Promise(async (resolve, reject) => {
    db.executeSql(
      sql,
      params,
      result => resolve(result as any /* TODO: Seems to be incorrect typings */),
      err => reject(err),
    );
  });
}

export async function select<TResult>(sql: string, params: any[]): Promise<TResult[]> {
  const result = await executeSql(sql, params);

  const rows: TResult[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }
  return rows;
}

type MigrationFunction = (db: SQLite.SQLiteDatabase) => Promise<unknown>;
const migrations: { [name: string]: MigrationFunction } = {};

export async function migrateIfNeeded() {
  const db = await open();
  await executeSql('CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, executed_at INTEGER)', []);
  const results = await executeSql('SELECT name FROM migrations', []);
  const previouslyExecutedMigrations = [];
  for (let i = 0; i < results.rows.length; i++) {
    previouslyExecutedMigrations.push(results.rows.item(i));
  }

  for (const migrationName of Object.keys(migrations)) {
    if (previouslyExecutedMigrations.indexOf(migrationName) === -1) {
      await migrations[migrationName](db);
      await executeSql('INSERT INTO migrations (name, executed_at) VALUES(?, ?)', [
        migrationName,
        new Date().valueOf(),
      ]);
    }
  }
}

export function registerMigration(date: number, name: string, migration: MigrationFunction) {
  migrations[date + '_' + name] = migration;
}
