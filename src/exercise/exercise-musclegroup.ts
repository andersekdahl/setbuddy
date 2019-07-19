import { executeSql, registerMigration } from '../db';

export async function addExerciseMusclegroup(exerciseId: string, musclegroup: string) {
  await executeSql('INSERT INTO exercises_musclegroups (exercise_id, musclegroup) VALUES(?, ?)', [
    exerciseId,
    musclegroup,
  ]);
  triggerEventListeners({ type: 'create', exerciseId: exerciseId, musclegroup: musclegroup });
}

export async function removeExerciseMusclegroup(exerciseId: string, musclegroup: string) {
  await executeSql('DELETE FROM exercises_musclegroups WHERE exercise_id = ? AND musclegroup = ?', [
    exerciseId,
    musclegroup,
  ]);
  triggerEventListeners({ type: 'remove', exerciseId: exerciseId, musclegroup: musclegroup });
}

type ExerciseEvent = {
  exerciseId: string;
  musclegroup: string;
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

registerMigration(201907300803, 'create-exercise-musclegroups', async db => {
  await db.executeSql(
    'CREATE TABLE exercises_musclegroups (exercise_id TEXT NOT NULL, musclegroup TEXT NOT NULL, PRIMARY KEY(exercise_id, musclegroup))',
  );
});
