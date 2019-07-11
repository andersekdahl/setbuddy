import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { AllGymsScreen, GymScreen } from './gym/screens';

const AppNavigator = createStackNavigator({
  Home: {
    screen: AllGymsScreen,
  },
  Gym: {
    screen: GymScreen,
  },
});

const AppContainer = createAppContainer(AppNavigator);

export default () => <AppContainer />;
