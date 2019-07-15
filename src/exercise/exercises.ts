import React from 'react';
import { select, executeSql, registerMigration } from '../db';
import { addGymExercise, removeGymExercise, getGymsByExercise } from '../gym/gyms';
import uuid from 'react-native-uuid-generator';

export type NewExercise = {
  name: string;
};

export type Exercise = NewExercise & {
  id: string;
};

export type ExerciseMuscleGroup = {
  exercise_id: string;
  musclegroup: string;
};

export const allMusclegroups = [
  'biceps',
  'triceps',
  'delts',
  'pecs',
  'lats',
  'upper back',
  'lower back',
  'abs',
  'quads',
  'hams',
  'calves',
];

export function getAllExercises() {
  return select<Exercise>('SELECT * FROM exercises', []);
}

export async function getExercise(exerciseId: string) {
  return (await select<Exercise>('SELECT * FROM exercises WHERE id = ?', [exerciseId]))[0];
}

export async function create(exercise: Omit<Exercise, 'id'>, musclegroups: string[], gymIds: string[]) {
  const exerciseId = await uuid.getRandomUUID();
  await executeSql('INSERT INTO exercises (id, name) VALUES(?, ?)', [exerciseId, exercise.name]);
  const ops: Promise<unknown>[] = [];
  for (const musclegroup of musclegroups) {
    addExerciseMusclegroup(exerciseId, musclegroup);
  }
  for (const gymId of gymIds) {
    ops.push(addGymExercise(gymId, exerciseId));
  }
  await Promise.all(ops);
  triggerEventListeners({ exerciseId: exerciseId, type: 'create' });
  return exerciseId;
}

export async function update(exercise: Exercise, musclegroups: string[] | null = null, gymIds: string[] | null = null) {
  await executeSql('UPDATE exercises SET name = ? WHERE id = ?', [exercise.name, exercise.id]);
  triggerEventListeners({ exerciseId: exercise.id, type: 'update' });
  const ops: Promise<unknown>[] = [];
  if (musclegroups) {
    const currentMusclegroups = await getExerciseMusclegroups(exercise.id);
    for (const musclegroup of musclegroups) {
      if (currentMusclegroups.indexOf(musclegroup) === -1) {
        ops.push(addExerciseMusclegroup(exercise.id, musclegroup));
      } else {
        ops.push(removeExerciseMusclegroup(exercise.id, musclegroup));
      }
    }
  }
  if (gymIds) {
    const currentGymIds = (await getGymsByExercise(exercise.id)).map(g => g.id);
    for (const gymId of gymIds) {
      if (currentGymIds.indexOf(gymId) === -1) {
        ops.push(addGymExercise(gymId, exercise.id));
      } else {
        ops.push(removeGymExercise(gymId, exercise.id));
      }
    }
  }
  if (ops.length) {
    await Promise.all(ops);
  }
}

export async function remove(exerciseId: string) {
  await executeSql('DELETE FROM exercises WHERE id = ?', [exerciseId]);
  triggerEventListeners({ exerciseId: exerciseId, type: 'remove' });
}

export async function getExerciseMusclegroups(exerciseId: string) {
  return (await select<ExerciseMuscleGroup>('SELECT * FROM exercises_musclegroups WHERE exercise_id = ?', [
    exerciseId,
  ])).map(em => em.musclegroup);
}

export async function addExerciseMusclegroup(exerciseId: string, musclegroup: string) {
  await executeSql('INSERT INTO exercises_musclegroups (exercise_id, musclegroup) VALUES(?, ?)', [
    exerciseId,
    musclegroup,
  ]);
  triggerEventListeners({ type: 'create', relation: 'musclegroup', exerciseId: exerciseId, musclegroup: musclegroup });
}

export async function removeExerciseMusclegroup(exerciseId: string, musclegroup: string) {
  await executeSql('DELETE FROM exercises_musclegroups WHERE exercise_id = ? AND musclegroup = ?', [
    exerciseId,
    musclegroup,
  ]);
  triggerEventListeners({ type: 'remove', relation: 'musclegroup', exerciseId: exerciseId, musclegroup: musclegroup });
}

type ExerciseEvent = {
  exerciseId: string;
  relation?: 'musclegroup';
  musclegroup?: string;
  type: 'create' | 'update' | 'remove';
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

export function useAllExercises() {
  const [allExercises, setAllExercises] = React.useState<Exercise[]>([]);
  React.useEffect(() => {
    (async () => {
      setAllExercises(await getAllExercises());
    })();

    return onDataChange(async e => {
      setAllExercises(await getAllExercises());
    });
  }, []);

  return allExercises;
}

export function useExercise(exerciseId: string | undefined) {
  const [exercise, setExercise] = React.useState<Exercise | NewExercise>({ name: '' });
  React.useEffect(() => {
    if (!exerciseId) {
      return;
    }

    (async () => {
      setExercise(await getExercise(exerciseId));
    })();

    return onDataChange(async e => {
      if (e.exerciseId === exerciseId) {
        setExercise(await getExercise(exerciseId));
      }
    });
  }, [exerciseId]);
  return exercise;
}

export function useExerciseMusclegroups(exerciseId: string | undefined) {
  const [exerciseMusclegroups, setExerciseMusclegroups] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!exerciseId) {
      return;
    }

    (async () => {
      setExerciseMusclegroups(await getExerciseMusclegroups(exerciseId));
    })();

    return onDataChange(async e => {
      if (e.exerciseId === exerciseId && e.relation === 'musclegroup') {
        setExerciseMusclegroups(await getExerciseMusclegroups(exerciseId));
      }
    });
  }, [exerciseId]);
  return exerciseMusclegroups;
}

registerMigration(201907300803, 'create-exercises', async db => {
  await db.executeSql('CREATE TABLE exercises (id TEXT PRIMARY KEY, name TEXT NOT NULL)');

  await db.executeSql(
    'CREATE TABLE exercises_musclegroups (exercise_id TEXT NOT NULL, musclegroup TEXT NOT NULL, PRIMARY KEY(exercise_id, musclegroup))',
  );
});
