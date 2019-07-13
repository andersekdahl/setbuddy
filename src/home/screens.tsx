import React from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { StyleSheet, ScrollView, View, Text, TouchableHighlight, Button, TextInput } from 'react-native';

export const HomeScreen = (props: NavigationScreenProps) => {
  return (
    <View>
      <View>
        <Button title="Manage gyms" onPress={() => props.navigation.navigate('AllGyms')} />
      </View>
      <View>
        <Button title="Manage exercises" onPress={() => props.navigation.navigate('AllExercises')} />
      </View>
    </View>
  );
};
