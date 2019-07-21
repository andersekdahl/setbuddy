import React from 'react';
import { useDerivedState } from '../hooks';
import { useAllRoutines, useRoutine, update, create, Routine } from './routines';
import { useExercisesByRoutine, Exercise } from '../exercise/exercises';
import { SelectExercisesModal } from '../exercise/screens';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getNavParam, getNavParamOrThrow, Screen, addOrRemove } from '../utils';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DraggableFlatList from 'react-native-draggable-flatlist';

export const AllRoutinesScreen: Screen = props => {
  const allRoutines = useAllRoutines();

  return (
    <ScrollView>
      <View>
        <Text>Routines</Text>
        {allRoutines.map(routine => (
          <View key={routine.id}>
            <TouchableHighlight onPress={() => props.navigation.navigate('Routine', { routineId: routine.id })}>
              <Text>{routine.name}</Text>
            </TouchableHighlight>
          </View>
        ))}
      </View>
      <Button title="Create routine" onPress={() => props.navigation.navigate('CreateRoutine')} />
    </ScrollView>
  );
};

type RoutineScreenParams = { routineId: string };

export const RoutineScreen: Screen<RoutineScreenParams> = props => {
  const routine = useRoutine(getNavParamOrThrow(props, 'routineId'));

  return (
    <View>
      <Text>{routine ? routine.name : ''}</Text>
    </View>
  );
};
RoutineScreen.navigationOptions = props => ({
  title: 'Gym',
  headerRight: (
    <Button
      onPress={() =>
        props.navigation.navigate('EditRoutine', {
          routineId: getNavParam(props as NavigationScreenProps<RoutineScreenParams>, 'routineId'),
        })
      }
      title="Edit"
    />
  ),
});

export const EditOrCreateRoutine: Screen<{ routineId?: string }> = props => {
  const routineId = getNavParam(props, 'routineId');
  const isCreate = !routineId;
  const routine = useRoutine(routineId);
  const routineExercieses = useExercisesByRoutine(routineId);
  const [selectExerciesVisible, setSelectExerciesVisible] = React.useState(false);
  const [selectedExercises, setSelectedExercises] = useDerivedState(routineExercieses);

  const [name, setName] = useDerivedState(routine.name);

  return (
    <View>
      <Text>{!isCreate ? 'Edit routine details' : 'Create routine'}</Text>
      <View>
        <Text>Name</Text>
        <TextInput onChangeText={e => setName(e)} value={name} />
      </View>
      <View style={{ height: 200 }}>
        <Text>Exercies</Text>
        <DraggableFlatList
          data={selectedExercises}
          renderItem={({ item, move, moveEnd }) => (
            <View key={item.id} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text style={{ flexGrow: 1 }}>{item.name}</Text>
              <TouchableHighlight onPressIn={move} onPressOut={moveEnd} style={{ padding: 5 }}>
                <Icon name="sort" />
              </TouchableHighlight>
              <TouchableHighlight
                style={{ padding: 5 }}
                onPress={() => {
                  setSelectedExercises(addOrRemove(item, selectedExercises));
                }}
              >
                <Icon name="trash-alt" />
              </TouchableHighlight>
            </View>
          )}
          onMoveEnd={({ data }) => setSelectedExercises(data)}
          keyExtractor={item => item.id}
        />
        <Button title="Add exercies" onPress={() => setSelectExerciesVisible(true)} />
      </View>
      <SelectExercisesModal
        selectedExercises={selectedExercises}
        visible={selectExerciesVisible}
        onSelect={s => {
          setSelectedExercises(s);
          setSelectExerciesVisible(false);
        }}
      />
      <Button
        title="Save"
        onPress={async () => {
          if (isCreate) {
            const routineId = await create({ name: name }, selectedExercises.map(e => e.id));
            props.navigation.navigate('AllRoutines');
          } else {
            await update({ name: name, id: routineId! }, selectedExercises.map(e => e.id));
            props.navigation.goBack();
          }
        }}
      />
    </View>
  );
};
