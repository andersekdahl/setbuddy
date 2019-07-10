import React from 'react';
import { migrateIfNeeded } from './db';
import { getAllGyms, Gym } from './gyms';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from 'react-native';

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [appLoadError, setAppLoadError] = React.useState(null);
  const [allGyms, setAllGyms] = React.useState<Gym[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        await migrateIfNeeded();
        setIsLoading(false);

        setAllGyms(await getAllGyms());
      } catch (err) {
        setAppLoadError(err);
        console.error(err);
      }
    })();
  }, []);

  if (appLoadError) {
    return (
      <View>
        <Text>Ouch, an error occured during app load :-(</Text>
        <Text>{JSON.stringify(appLoadError)}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.gyms}>
        <Text style={styles.gymsHeading}>Gyms</Text>
        {allGyms.map(gym => (
          <View style={styles.gymContainer}>
            <Text>{gym.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  gyms: {},
  gymsHeading: {},
  gymContainer: {},
});

export default App;
