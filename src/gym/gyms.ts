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
  triggerEventListeners({ gymId: gymId, type: 'create' });
  return gymId;
}

export async function update(gym: Gym) {
  await executeSql('UPDATE gyms SET name = ? WHERE id = ?', [gym.name, gym.id]);
  triggerEventListeners({ gymId: gym.id, type: 'update' });
}

export async function remove(gymId: string) {
  await executeSql('DELETE FROM gyms WHERE id = ?', [gymId]);
  triggerEventListeners({ gymId: gymId, type: 'remove' });
}

type GymEvent = { gymId: string; type: 'create' | 'update' | 'remove' };
type EventListener = (event: GymEvent) => unknown;
const eventListeners: EventListener[] = [];
export function addEventListener(listener: EventListener) {
  eventListeners.push(listener);
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  };
}

function triggerEventListeners(event: GymEvent) {
  for (const listener of eventListeners) {
    listener(event);
  }
}

export function useAllGyms() {
  const [allGyms, setAllGyms] = React.useState<Gym[]>([]);
  React.useEffect(() => {
    (async () => {
      setAllGyms(await getAllGyms());
    })();

    return addEventListener(async e => {
      setAllGyms(await getAllGyms());
    });
  }, []);

  return allGyms;
}

export function useGym(id: string) {
  const [gym, setGym] = React.useState<Gym | null>(null);
  React.useEffect(() => {
    (async () => {
      setGym(await getGym(id));
    })();

    return addEventListener(async e => {
      if (e.gymId === id) {
        setGym(await getGym(id));
      }
    });
  }, [id]);
  return gym;
}

registerMigration(201907300803, 'create-gyms', async db => {
  await db.executeSql('CREATE TABLE gyms (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat NUMERIC, lng NUMERIC)');

  const gymId = await uuid.getRandomUUID();
  await db.executeSql('INSERT INTO gyms (id, name) VALUES(?, ?)', [gymId, 'My local gym']);
});
