import 'react-native-get-random-values';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from './src/screens/Homepage';
import PlanetHome from './src/screens/PlanetHome';
import GameSelection from './src/screens/GameSelection';
import PlanetSelection from './src/screens/PlanetSelection';
import BalloonSelection from './src/screens/BalloonSelection';
import Quiz from './src/screens/Quiz';
import BalloonGame from './src/screens/BalloonGame';
import Lessons from './src/screens/Lessons';
import MarsLevelSelection from './src/screens/MarsLevelSelection';
import MarsGame from './src/screens/MarsGame';
import WhackSelection from './src/screens/WhackSelection';
import WhackGame from './src/screens/WhackGame';
import Results from './src/screens/Results';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Homepage"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Homepage" component={Homepage} />
        <Stack.Screen name="PlanetHome" component={PlanetHome} />
        <Stack.Screen name="GameSelection" component={GameSelection} />
        <Stack.Screen name="PlanetSelection" component={PlanetSelection} />
        <Stack.Screen name="BalloonSelection" component={BalloonSelection} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="BalloonGame" component={BalloonGame} />
        <Stack.Screen name="Lessons" component={Lessons} />
        <Stack.Screen name="MarsLevelSelection" component={MarsLevelSelection} />
        <Stack.Screen name="MarsGame" component={MarsGame} />
        <Stack.Screen name="WhackSelection" component={WhackSelection} />
        <Stack.Screen name="WhackGame" component={WhackGame} />
        <Stack.Screen name="Results" component={Results} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
