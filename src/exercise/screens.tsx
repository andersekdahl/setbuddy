import React from 'react';
import { useDerivedState } from '../hooks';
import { useAllExercises, useExercise, update, create, allMusclegroups, useExerciseMusclegroups } from './exercises';
import { getNavParam, getNavParamOrThrow } from '../utils';
import { useAllGyms, useGymsByExercise } from '../gym/gyms';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput, CheckBox } from 'react-native';
import { NavigationScreenProps, NavigationScreenComponent, NavigationStackScreenOptions } from 'react-navigation';

export const AllExercisesScreen: NavigationScreenComponent<{}, NavigationStackScreenOptions> = (
  props: NavigationScreenProps,
) => {
  const allExercises = useAllExercises();

  return (
    <ScrollView>
      <View style={styles.exercises}>
        <Text style={styles.exercisesHeading}>Exercises</Text>
        {allExercises.map(exercise => (
          <View key={exercise.id} style={styles.exerciseContainer}>
            <TouchableHighlight onPress={() => props.navigation.navigate('Exercise', { exerciseId: exercise.id })}>
              <Text>{exercise.name}</Text>
            </TouchableHighlight>
          </View>
        ))}
      </View>
      <Button title="Create exercise" onPress={() => props.navigation.navigate('CreateExercise')} />
    </ScrollView>
  );
};
AllExercisesScreen.navigationOptions = {
  title: 'All exercises',
};

type ExerciseScreenParams = { exerciseId: string };

export const ExerciseScreen: NavigationScreenComponent<ExerciseScreenParams, NavigationStackScreenOptions> = (
  props: NavigationScreenProps,
) => {
  const exerciseId = getNavParamOrThrow(props, 'exerciseId');
  const exercise = useExercise(exerciseId);
  const exerciseGyms = useGymsByExercise(exerciseId);
  const exerciseMusclegroups = useExerciseMusclegroups(exerciseId);

  return (
    <View>
      <Text>{exercise ? exercise.name : ''}</Text>
      <View>
        <Text>Musclegroups:</Text>
        {exerciseMusclegroups.map(musclegroup => (
          <Text key={musclegroup}>{musclegroup}</Text>
        ))}
      </View>
      <View>
        <Text>Available at these gyms:</Text>
        {exerciseGyms.map(gym => (
          <TouchableHighlight key={gym.id} onPress={() => props.navigation.navigate('Gym', { gymId: gym.id })}>
            <Text>{gym.name}</Text>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
};
ExerciseScreen.navigationOptions = props => ({
  title: 'Exercise',
  headerRight: (
    <Button
      onPress={() =>
        props.navigation.navigate('EditExercise', {
          exerciseId: getNavParam(props as NavigationScreenProps<ExerciseScreenParams>, 'exerciseId'),
        })
      }
      title="Edit"
    />
  ),
});

type EditOrCreateExerciseScreenParams = { exerciseId?: string };

export const EditOrCreateExercise: NavigationScreenComponent = (
  props: NavigationScreenProps<EditOrCreateExerciseScreenParams>,
) => {
  const exerciseId = getNavParam(props, 'exerciseId');
  const isCreate = !exerciseId;
  const exercise = useExercise(exerciseId);

  const [name, setName] = useDerivedState(exercise.name);

  const allGyms = useAllGyms();
  const exerciseGyms = useGymsByExercise(exerciseId);
  const [exerciseGymIds, setExerciseGymIds] = useDerivedState(exerciseGyms.map(wg => wg.id));
  console.log('exerciseGymIds', exerciseGymIds);
  const currentExerciseMusclegroups = useExerciseMusclegroups(exerciseId);
  const [exerciseMusclegroups, setExerciseMusclegroups] = useDerivedState(currentExerciseMusclegroups);

  return (
    <View>
      <Text>{!isCreate ? 'Edit exercise details' : 'Create exercise'}</Text>
      <View>
        <Text>Name</Text>
        <TextInput onChangeText={e => setName(e)} value={name} />
      </View>
      <View>
        <Text>Muscle groups</Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {allMusclegroups.map(musclegroup => (
            <View key={musclegroup} style={{ display: 'flex', flexDirection: 'row', width: '33%' }}>
              <CheckBox
                value={exerciseMusclegroups.indexOf(musclegroup) !== -1}
                onChange={v => {
                  if (v) {
                    const r = exerciseMusclegroups.slice();
                    r.push(musclegroup);
                    setExerciseMusclegroups(r);
                  } else {
                    const r = exerciseMusclegroups.slice();
                    r.splice(exerciseMusclegroups.indexOf(musclegroup), 1);
                    setExerciseMusclegroups(r);
                  }
                }}
              />
              <Text>{musclegroup}</Text>
            </View>
          ))}
        </View>
      </View>
      <View>
        <Text>Gyms</Text>
        <View>
          {allGyms.map(gym => (
            <View key={gym.id} style={{ display: 'flex', flexDirection: 'row' }}>
              <CheckBox
                value={exerciseGymIds.indexOf(gym.id) !== -1}
                onChange={v => {
                  if (v) {
                    const r = exerciseGymIds.slice();
                    r.push(gym.id);
                    setExerciseGymIds(r);
                  } else {
                    const r = exerciseGymIds.splice(exerciseGymIds.indexOf(gym.id), 1);
                    setExerciseGymIds(r);
                  }
                }}
              />
              <Text>{gym.name}</Text>
            </View>
          ))}
        </View>
      </View>
      <Button
        title="Save"
        onPress={async () => {
          if (isCreate) {
            const exerciseId = await create({ name: name }, exerciseMusclegroups, exerciseGymIds);
          } else {
            await update({ name: name, id: exerciseId! }, exerciseMusclegroups, exerciseGymIds);
          }
          props.navigation.navigate('Home');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  exercises: {},
  exercisesHeading: {},
  exerciseContainer: {},
});
