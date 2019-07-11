import React from 'react';
import { useAllGyms, useGym } from './gyms';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight } from 'react-native';
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

const styles = StyleSheet.create({
  gyms: {},
  gymsHeading: {},
  gymContainer: {},
});
