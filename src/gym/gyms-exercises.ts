import { executeSql, registerMigration } from '../db';

export async function addGymExercise(gymId: string, exerciseId: string) {
  await executeSql('INSERT INTO gyms_exercises (gym_id, exercise_id) VALUES(?, ?)', [gymId, exerciseId]);
  triggerEventListeners({ type: 'create', exerciseId: exerciseId, gymId: gymId });
}

export async function removeGymExercise(gymId: string, exerciseId: string) {
  await executeSql('DELETE FROM gyms_exercises WHERE gym_id = ? AND exercise_id = ?', [exerciseId, gymId]);
  triggerEventListeners({ type: 'remove', exerciseId: exerciseId, gymId: gymId });
}

type ExerciseEvent = {
  exerciseId: string;
  gymId: string;
  type: 'create' | 'remove';
};
type EventListener = (event: ExerciseEvent) => unknown;
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

function triggerEventListeners(event: ExerciseEvent) {
  for (const listener of eventListeners) {
    listener(event);
  }
}

registerMigration(201907300803, 'create-gyms-exercises', async db => {
  await db.executeSql(
    'CREATE TABLE gyms_exercises (gym_id TEXT NOT NULL, exercise_id TEXT NOT NULL, PRIMARY KEY(gym_id, exercise_id))',
  );
});
