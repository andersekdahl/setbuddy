import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { HomeScreen } from './home/screens';
import { AllRoutinesScreen, RoutineScreen, EditOrCreateRoutine } from './routine/screens';
import { AllGymsScreen, GymScreen, EditOrCreateGym } from './gym/screens';
import { AllExercisesScreen, EditOrCreateExercise, ExerciseScreen } from './exercise/screens';

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },

  AllRoutines: {
    screen: AllRoutinesScreen,
  },
  Routine: {
    screen: RoutineScreen,
  },
  EditRoutine: {
    screen: EditOrCreateRoutine,
  },
  CreateRoutine: {
    screen: EditOrCreateRoutine,
  },

  AllGyms: {
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

  AllExercises: {
    screen: AllExercisesScreen,
  },
  Exercise: {
    screen: ExerciseScreen,
  },
  EditExercise: {
    screen: EditOrCreateExercise,
  },
  CreateExercise: {
    screen: EditOrCreateExercise,
  },
});

const AppContainer = createAppContainer(AppNavigator);
console.log('Starting app');
export default () => <AppContainer />;
