import React from 'react';
import { useDerivedState } from '../hooks';
import { useAllGyms, useGym, update, create, Gym } from './gyms';
import { ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';
import { NavigationScreenProps, NavigationScreenComponent, NavigationStackScreenOptions } from 'react-navigation';
import { getNavParam, getNavParamOrThrow, Screen } from '../utils';

export const AllGymsScreen: Screen = props => {
  const allGyms = useAllGyms();

  return (
    <ScrollView>
      <View>
        <Text>Gyms</Text>
        {allGyms.map(gym => (
          <View key={gym.id}>
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

type GymScreenParams = { gymId: string };

export const GymScreen: Screen<GymScreenParams> = props => {
  const gym = useGym(getNavParamOrThrow(props, 'gymId'));

  return (
    <View>
      <Text>{gym ? gym.name : ''}</Text>
    </View>
  );
};
GymScreen.navigationOptions = props => ({
  title: 'Gym',
  headerRight: (
    <Button
      onPress={() =>
        props.navigation.navigate('EditGym', {
          gymId: getNavParam(props as NavigationScreenProps<GymScreenParams>, 'gymId'),
        })
      }
      title="Edit"
    />
  ),
});

export const EditOrCreateGym: Screen<{ gymId?: string }> = props => {
  const gymId = getNavParam(props, 'gymId');
  const isCreate = !gymId;
  const gym = useGym(gymId);

  const [name, setName] = useDerivedState(gym.name);

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
          if (isCreate) {
            const gymId = await create({ name: name });
            props.navigation.navigate('AllGyms');
          } else {
            await update({ name: name, id: gymId! });
            props.navigation.goBack();
          }
        }}
      />
    </View>
  );
};
