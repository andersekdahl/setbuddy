import React from 'react';
import { select, executeSql, registerMigration } from '../db';
import uuid from 'react-native-uuid-generator';

export type NewGym = {
  name: string;
};

export type Gym = NewGym & {
  id: string;
};

export function getAllGyms() {
  return select<Gym>('SELECT * FROM gyms', []);
}

export async function getGymsByExercise(exerciseId: string) {
  return await select<Gym>(
    'SELECT g.* FROM gyms AS g INNER JOIN gyms_exercises AS wg ON g.id = wg.gym_id WHERE wg.exercise_id = ?',
    [exerciseId],
  );
}

export async function getGym(gymId: string) {
  return (await select<Gym>('SELECT * FROM gyms WHERE id = ?', [gymId]))[0];
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

export async function addGymExercise(gymId: string, exerciseId: string) {
  await executeSql('INSERT INTO gyms_exercises (gym_id, exercise_id) VALUES(?, ?)', [gymId, exerciseId]);
  triggerEventListeners({ gymId: gymId, type: 'create', relation: 'exercise', exerciseId: exerciseId });
}

export async function removeGymExercise(gymId: string, exerciseId: string) {
  await executeSql('DELETE FROM gyms_exercises WHERE gym_id = ? AND exercise_id = ?', [gymId, exerciseId]);
  triggerEventListeners({ gymId: gymId, type: 'remove', relation: 'exercise', exerciseId: exerciseId });
}

type GymEvent = { gymId: string; exerciseId?: string; relation?: 'exercise'; type: 'create' | 'update' | 'remove' };
type EventListener = (event: GymEvent) => unknown;
const eventListeners: EventListener[] = [];
export function onDataChange(listener: EventListener) {
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
  const [allGyms, setAllGyms] = React.useState<readonly Gym[]>([]);
  React.useEffect(() => {
    (async () => {
      setAllGyms(await getAllGyms());
    })();

    return onDataChange(async e => {
      setAllGyms(await getAllGyms());
    });
  }, []);

  return allGyms;
}

export function useGym(gymId: string | undefined) {
  const [gym, setGym] = React.useState<Gym | NewGym>({ name: '' });
  React.useEffect(() => {
    if (!gymId) {
      return;
    }
    (async () => {
      setGym(await getGym(gymId));
    })();

    return onDataChange(async e => {
      if (e.gymId === gymId) {
        setGym(await getGym(gymId));
      }
    });
  }, [gymId]);
  return gym;
}

export function useGymsByExercise(exerciseId: string | undefined) {
  const [gyms, setGyms] = React.useState<readonly Gym[]>([]);
  React.useEffect(() => {
    if (!exerciseId) {
      return;
    }

    (async () => {
      setGyms(await getGymsByExercise(exerciseId));
    })();

    return onDataChange(async e => {
      if (e.exerciseId === exerciseId) {
        setGyms(await getGymsByExercise(exerciseId));
      }
    });
  }, []);

  return gyms;
}

registerMigration(201907300803, 'create-gyms', async db => {
  await db.executeSql('CREATE TABLE gyms (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat NUMERIC, lng NUMERIC)');

  const gymId = await uuid.getRandomUUID();
  await db.executeSql('INSERT INTO gyms (id, name) VALUES(?, ?)', [gymId, 'My local gym']);

  await db.executeSql('CREATE TABLE gyms_exercises (gym_id TEXT, exercise_id TEXT, PRIMARY KEY(gym_id, exercise_id))');
});
