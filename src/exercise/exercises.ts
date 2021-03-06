import React from 'react';
import { select, executeSql, registerMigration } from '../db';
import { getGymsByExercise } from '../gym/gyms';
import { addGymExercise, removeGymExercise } from '../gym/gyms-exercises';
import { onDataChange as onRoutineExerciseDataChange } from '../routine/routine-exercises';
import {
  addExerciseMusclegroup,
  removeExerciseMusclegroup,
  onDataChange as onExerciseMusclegroupDataChange,
} from './exercise-musclegroup';
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
  'Biceps',
  'Triceps',
  'Delts',
  'Pecs',
  'Lats',
  'Upper back',
  'Lower back',
  'Abs',
  'Quads',
  'Hams',
  'Calves',
];

export function getAllExercises() {
  return select<Exercise>('SELECT * FROM exercises', []);
}

export async function getExercise(exerciseId: string) {
  return (await select<Exercise>('SELECT * FROM exercises WHERE id = ?', [exerciseId]))[0];
}

export async function getExercisesByRoutine(routineId: string) {
  return await select<Exercise>(
    'SELECT e.* FROM exercises AS e INNER JOIN routines_exercises AS re ON e.id = re.exercise_id WHERE re.routine_id = ? ORDER BY re.sort_order ASC',
    [routineId],
  );
}

export async function create(
  exercise: Omit<Exercise, 'id'>,
  musclegroups: readonly string[],
  gymIds: readonly string[],
) {
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

export async function update(
  exercise: Exercise,
  musclegroups: readonly string[] | undefined = undefined,
  gymIds: readonly string[] | undefined = undefined,
) {
  await executeSql('UPDATE exercises SET name = ? WHERE id = ?', [exercise.name, exercise.id]);
  triggerEventListeners({ exerciseId: exercise.id, type: 'update' });
  const ops: Promise<unknown>[] = [];
  if (musclegroups) {
    const currentMusclegroups = await getExerciseMusclegroups(exercise.id);
    for (const musclegroup of musclegroups) {
      if (currentMusclegroups.indexOf(musclegroup) === -1) {
        ops.push(addExerciseMusclegroup(exercise.id, musclegroup));
      }
    }
    for (const currentMusclegroup of currentMusclegroups) {
      if (musclegroups.indexOf(currentMusclegroup) === -1) {
        ops.push(removeExerciseMusclegroup(exercise.id, currentMusclegroup));
      }
    }
  }
  if (gymIds) {
    const currentGymIds = (await getGymsByExercise(exercise.id)).map(g => g.id);
    for (const gymId of gymIds) {
      if (currentGymIds.indexOf(gymId) === -1) {
        ops.push(addGymExercise(gymId, exercise.id));
      }
    }
    for (const currentGymId of currentGymIds) {
      if (gymIds.indexOf(currentGymId) === -1) {
        ops.push(removeGymExercise(currentGymId, exercise.id));
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

export async function getExerciseMusclegroups(exerciseId: string): Promise<readonly string[]> {
  return (await select<ExerciseMuscleGroup>('SELECT * FROM exercises_musclegroups WHERE exercise_id = ?', [
    exerciseId,
  ])).map(em => em.musclegroup);
}

type ExerciseEvent = {
  exerciseId: string;
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
  const [allExercises, setAllExercises] = React.useState<readonly Exercise[]>([]);
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

export function useExercisesByRoutine(routineId: string | undefined) {
  const [exercises, setExercies] = React.useState<readonly Exercise[]>([]);
  React.useEffect(() => {
    if (!routineId) {
      return;
    }

    (async () => {
      setExercies(await getExercisesByRoutine(routineId));
    })();

    return onRoutineExerciseDataChange(async e => {
      if (e.routineId === routineId) {
        setExercies(await getExercisesByRoutine(routineId));
      }
    });
  }, []);

  return exercises;
}

export function useExerciseMusclegroups(exerciseId: string | undefined): readonly string[] {
  const [exerciseMusclegroups, setExerciseMusclegroups] = React.useState<readonly string[]>([]);
  React.useEffect(() => {
    if (!exerciseId) {
      return;
    }

    (async () => {
      setExerciseMusclegroups(await getExerciseMusclegroups(exerciseId));
    })();

    return onExerciseMusclegroupDataChange(async e => {
      if (e.exerciseId === exerciseId) {
        setExerciseMusclegroups(await getExerciseMusclegroups(exerciseId));
      }
    });
  }, [exerciseId]);
  return exerciseMusclegroups;
}

registerMigration(201907300803, 'create-exercises', async db => {
  await db.executeSql('CREATE TABLE exercises (id TEXT PRIMARY KEY, name TEXT NOT NULL)');
});
