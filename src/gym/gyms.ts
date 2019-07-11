import React from 'react';
import { select, executeSql, registerMigration } from '../db';
import uuid from 'react-native-uuid-generator';

export type Gym = {
  id: string;
  name: string;
};

export function getAllGyms() {
  return select<Gym>('SELECT * FROM gyms', []);
}

export async function getGym(id: string) {
  return (await select<Gym>('SELECT * FROM gyms WHERE id = ?', [id]))[0];
}

export async function create(gym: Omit<Gym, 'id'>) {
  const gymId = await uuid.getRandomUUID();
  await executeSql('INSERT INTO gyms (id, name) VALUES(?, ?)', [gymId, gym.name]);
  return gymId;
}

export async function update(gym: Gym) {
  await executeSql('UPDATE gyms SET name = ? WHERE id = ?', [gym.name, gym.id]);
}

export function useAllGyms() {
  const [allGyms, setAllGyms] = React.useState<Gym[]>([]);
  React.useEffect(() => {
    (async () => {
      setAllGyms(await getAllGyms());
    })();
  }, []);
  return allGyms;
}

export function useGym(id: string) {
  const [gym, setGym] = React.useState<Gym | null>(null);
  React.useEffect(() => {
    (async () => {
      setGym(await getGym(id));
    })();
  }, [id]);
  return gym;
}

registerMigration(201907300803, 'create-gyms', async db => {
  await db.executeSql('CREATE TABLE gyms (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat NUMERIC, lng NUMERIC)');

  const gymId = await uuid.getRandomUUID();
  await db.executeSql('INSERT INTO gyms (id, name) VALUES(?, ?)', [gymId, 'My local gym']);
});
