import React from 'react';
import { useAllGyms, useGym, update, create, Gym } from './gyms';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

export const AllGymsScreen = (props: NavigationScreenProps) => {
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

export const GymScreen = (props: NavigationScreenProps) => {
  const gym = useGym(props.navigation.getParam('gymId'));

  return (
    <View>
      <Text>{gym ? gym.name : ''}</Text>
    </View>
  );
};

export const EditOrCreateGym = (props: NavigationScreenProps) => {
  let gym: Gym | null = null;
  const gymId = props.navigation.getParam('gymId');
  const isCreate = !gymId;
  if (gymId) {
    gym = useGym(gymId);
  }

  const [name, setName] = React.useState(gym ? gym.name : '');

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
