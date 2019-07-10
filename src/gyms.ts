import { select, registerMigration } from './db';
import uuid from 'react-native-uuid-generator';

export type Gym = {
  id: string;
  name: string;
};

export function getAllGyms() {
  return select<Gym>('SELECT * FROM gyms', []);
}

registerMigration(201907300803, 'create-gyms', async db => {
  await db.executeSql('CREATE TABLE gyms (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat NUMERIC, lng NUMERIC)');

  const gymId = await uuid.getRandomUUID();
  await db.executeSql('INSERT INTO gyms (id, name) VALUES(?, ?)', [gymId, 'My local gym']);
});
