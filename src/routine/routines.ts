import React from 'react';
import { select, executeSql, registerMigration } from '../db';
import uuid from 'react-native-uuid-generator';

export type NewRoutine = {
  name: string;
};

export type Routine = NewRoutine & {
  id: string;
};

export function getAllRoutines() {
  return select<Routine>('SELECT * FROM routines', []);
}

export async function getRoutine(routineId: string) {
  return (await select<Routine>('SELECT * FROM routines WHERE id = ?', [routineId]))[0];
}

export async function create(routine: NewRoutine) {
  const routineId = await uuid.getRandomUUID();
  await executeSql('INSERT INTO routines (id, name) VALUES(?, ?)', [routineId, routine.name]);
  triggerEventListeners({ routineId: routineId, type: 'create' });
  return routineId;
}

export async function update(routine: Routine) {
  await executeSql('UPDATE routines SET name = ? WHERE id = ?', [routine.name, routine.id]);
  triggerEventListeners({ routineId: routine.id, type: 'update' });
}

export async function remove(routineId: string) {
  await executeSql('DELETE FROM routines WHERE id = ?', [routineId]);
  triggerEventListeners({ routineId: routineId, type: 'remove' });
}

type RoutineEvent = {
  routineId: string;
  exerciseId?: string;
  relation?: 'exercise';
  type: 'create' | 'update' | 'remove';
};
type EventListener = (event: RoutineEvent) => unknown;
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

function triggerEventListeners(event: RoutineEvent) {
  for (const listener of eventListeners) {
    listener(event);
  }
}

export function useAllRoutines() {
  const [allRoutines, setAllRoutines] = React.useState<readonly Routine[]>([]);
  React.useEffect(() => {
    (async () => {
      setAllRoutines(await getAllRoutines());
    })();

    return onDataChange(async e => {
      setAllRoutines(await getAllRoutines());
    });
  }, []);

  return allRoutines;
}

export function useRoutine(routineId: string | undefined) {
  const [routine, setRoutine] = React.useState<Routine | NewRoutine>({ name: '' });
  React.useEffect(() => {
    if (!routineId) {
      return;
    }
    (async () => {
      setRoutine(await getRoutine(routineId));
    })();

    return onDataChange(async e => {
      if (e.routineId === routineId) {
        setRoutine(await getRoutine(routineId));
      }
    });
  }, [routineId]);
  return routine;
}

registerMigration(201907300803, 'create-routines', async db => {
  await db.executeSql('CREATE TABLE routines (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at NUMERIC)');
});
