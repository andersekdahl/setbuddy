import React from 'react';
import { useStateFromProp } from '../hooks';
import { useAllGyms, useGym, update, create, Gym } from './gyms';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getNavParam, getNavParamOrThrow } from '../utils';

export const AllGymsScreen = (props: NavigationScreenProps<{}>) => {
  const allGyms = useAllGyms();

  return (
    <ScrollView>
      <View style={styles.gyms}>
        <Text style={styles.gymsHeading}>Gyms</Text>
        {allGyms.map(gym => (
          <View key={gym.id} style={styles.gymContainer}>
            <TouchableHighlight onPress={() => props.navigation.navigate('Gym', { gymId: gym.id })}>
              <Text>{gym.name}</Text>
            </TouchableHighlight>
          </View>
        ))}
      </View>
      <Button title="Create gym" onPress={() => props.navigation.navigate('CreateGym')} />
    </ScrollView>
  );
};

export const GymScreen = (props: NavigationScreenProps<{ gymId: string }>) => {
  const gym = useGym(getNavParamOrThrow(props, 'gymId'));

  return (
    <View>
      <Text>{gym ? gym.name : ''}</Text>
    </View>
  );
};

export const EditOrCreateGym = (props: NavigationScreenProps<{ gymId?: string }>) => {
  const gymId = getNavParam(props, 'gymId');
  const isCreate = !gymId;
  const gym = useGym(gymId);

  const [name, setName] = useStateFromProp(gym.name);

  return (
    <View>
      <Text>{!isCreate ? 'Edit gym details' : 'Create gym'}</Text>
      <View>
        <Text>Name</Text>
        <TextInput onChangeText={e => setName(e)} value={name} />
      </View>
      <Button
        title="Save"
        onPress={async () => {
          let gymId: string;
          if (isCreate) {
            gymId = await create({ name: name });
          } else {
            await update({ name: name, id: gymId! });
          }
          props.navigation.navigate('Home');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gyms: {},
  gymsHeading: {},
  gymContainer: {},
});
