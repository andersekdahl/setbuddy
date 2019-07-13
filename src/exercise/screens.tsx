import React from 'react';
import {
  useAllExercises,
  useExercise,
  update,
  create,
  Exercise,
  allMusclegroups,
  useExerciseMusclegroups,
} from './exercises';
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

export const ExerciseScreen: NavigationScreenComponent<{ exerciseId: string }, NavigationStackScreenOptions> = (
  props: NavigationScreenProps,
) => {
  const exerciseId = props.navigation.getParam('exerciseId');
  const exercise = useExercise(exerciseId);
  const exerciseGyms = useGymsByExercise(exerciseId);
  const exerciseMusclegroups = useExerciseMusclegroups(exerciseId);

  return (
    <View>
      <Text>{exercise ? exercise.name : ''}</Text>
      <View>
        <Text>Musclegroups:</Text>
        {exerciseMusclegroups.map(musclegroup => (
          <Text>{musclegroup}</Text>
        ))}
      </View>
      <View>
        <Text>Available at these gyms:</Text>
        {exerciseGyms.map(gym => (
          <TouchableHighlight onPress={() => props.navigation.navigate('Gym', { gymId: gym.id })}>
            <Text>{gym.name}</Text>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
};
ExerciseScreen.navigationOptions = ({ navigation }) => ({
  title: 'Exercise',
  headerRight: (
    <Button
      onPress={() => navigation.navigate('EditExercise', { exerciseId: navigation.getParam('exerciseId') })}
      title="Edit"
    />
  ),
});

export const EditOrCreateExercise: NavigationScreenComponent = (props: NavigationScreenProps) => {
  let exercise: Exercise | null = null;
  const exerciseId = props.navigation.getParam('exerciseId');
  const isCreate = !exerciseId;
  if (exerciseId) {
    exercise = useExercise(exerciseId);
  }

  const exerciseName = exercise ? exercise.name : '';
  const [name, setName] = React.useState(exerciseName);
  React.useEffect(() => setName(exerciseName), [exerciseName]);

  const allGyms = useAllGyms();
  const exerciseGyms = useGymsByExercise(exerciseId);
  const [exerciseGymIds, setExerciseGymIds] = React.useState(exerciseGyms.map(wg => wg.id));
  const currentExerciseMusclegroups = useExerciseMusclegroups(exerciseId);
  const [exerciseMusclegroups, setExerciseMusclegroups] = React.useState(currentExerciseMusclegroups);

  return (
    <View>
      <Text>{!isCreate ? 'Edit exercise details' : 'Create exercise'}</Text>
      <View>
        <Text>Name</Text>
        <TextInput onChangeText={e => setName(e)} value={name} />
      </View>
      {allMusclegroups.map(musclegroup => (
        <View key={musclegroup}>
          <CheckBox
            value={exerciseMusclegroups.indexOf(musclegroup) !== -1}
            onChange={v => {
              if (v) {
                const r = exerciseMusclegroups.slice();
                r.push(musclegroup);
                setExerciseMusclegroups(r);
              } else {
                const r = exerciseMusclegroups.splice(exerciseMusclegroups.indexOf(musclegroup), 1);
                setExerciseMusclegroups(r);
              }
            }}
          />
          <Text>{musclegroup}</Text>
        </View>
      ))}
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
      <Button
        title="Save"
        onPress={async () => {
          let exerciseId: string;
          if (isCreate) {
            exerciseId = await create({ name: name }, exerciseMusclegroups, exerciseGymIds);
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
