import React from 'react';
import { useDerivedState } from '../hooks';
import { useAllRoutines, useRoutine, update, create, Routine } from './routines';
import { useExerciesesByRoutine } from '../exercise/exercises';
import { SelectExercisesModal } from '../exercise/screens';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getNavParam, getNavParamOrThrow, Screen } from '../utils';

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

export const RoutineScreen: Screen<{ routineId: string }> = props => {
  const routine = useRoutine(getNavParamOrThrow(props, 'routineId'));

  return (
    <View>
      <Text>{routine ? routine.name : ''}</Text>
    </View>
  );
};

export const EditOrCreateRoutine: Screen<{ routineId?: string }> = props => {
  const routineId = getNavParam(props, 'routineId');
  const isCreate = !routineId;
  const routine = useRoutine(routineId);
  const routineExercieses = useExerciesesByRoutine(routineId);
  const [selectExerciesVisible, setSelectExerciesVisible] = React.useState(false);
  const [selectedExercises, setSelectedExercises] = React.useState<readonly string[]>([]);

  const [name, setName] = useDerivedState(routine.name);

  return (
    <View>
      <Text>{!isCreate ? 'Edit routine details' : 'Create routine'}</Text>
      <View>
        <Text>Name</Text>
        <TextInput onChangeText={e => setName(e)} value={name} />
      </View>
      <View>
        <Text>Exercies</Text>
        {routineExercieses.map(e => (
          <View key={e.id}>
            <Text>{e.name}</Text>
          </View>
        ))}
        <Button title="Add exercies" onPress={() => setSelectExerciesVisible(true)} />
      </View>
      <SelectExercisesModal visible={selectExerciesVisible} onSelect={s => setSelectedExercises(s)} />
      <Button
        title="Save"
        onPress={async () => {
          let routineId: string;
          if (isCreate) {
            routineId = await create({ name: name });
          } else {
            await update({ name: name, id: routineId! });
          }
          props.navigation.navigate('Home');
        }}
      />
    </View>
  );
};
