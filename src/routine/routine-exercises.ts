import React from 'react';
import { executeSql, registerMigration } from '../db';

export async function addRoutineExercise(routineId: string, exerciseId: string) {
  await executeSql('UPDATE routines_exercises SET sort_order = sort_order + 1 WHERE routine_id = ?', [routineId]);
  await executeSql('INSERT INTO routines_exercises (routine_id, exercise_id, sort_order) VALUES(?, ?, ?)', [
    routineId,
    exerciseId,
    0,
  ]);
  triggerEventListeners({ routineId: routineId, type: 'create', exerciseId: exerciseId });
}

export async function removeRoutineExercise(routineId: string, exerciseId: string) {
  await executeSql('DELETE FROM routines_exercises WHERE routine_id = ? AND exercise_id = ?', [routineId, exerciseId]);
  triggerEventListeners({ routineId: routineId, type: 'remove', exerciseId: exerciseId });
}

type RoutineExerciseEvent = {
  routineId: string;
  exerciseId: string;
  type: 'create' | 'update' | 'remove';
};
type EventListener = (event: RoutineExerciseEvent) => unknown;
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

function triggerEventListeners(event: RoutineExerciseEvent) {
  for (const listener of eventListeners) {
    listener(event);
  }
}

registerMigration(201907300803, 'create-routine-exercises', async db => {
  await db.executeSql(
    'CREATE TABLE routines_exercises (routine_id TEXT, exercise_id TEXT, sort_order NUMERIC, PRIMARY KEY(routine_id, exercise_id))',
  );
});
