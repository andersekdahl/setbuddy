import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { AllGymsScreen, GymScreen, EditOrCreateGym } from './gym/screens';

const AppNavigator = createStackNavigator({
  Home: {
    screen: AllGymsScreen,
  },
  Gym: {
    screen: GymScreen,
  },
  EditGym: {
    screen: EditOrCreateGym,
  },
  CreateGym: {
    screen: EditOrCreateGym,
  },
});

const AppContainer = createAppContainer(AppNavigator);

export default () => <AppContainer />;
