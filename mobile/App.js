import 'react-native-get-random-values';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from './src/screens/Homepage';
import PlanetSelection from './src/screens/PlanetSelection';
import Quiz from './src/screens/Quiz';
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
        <Stack.Screen name="PlanetSelection" component={PlanetSelection} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="Results" component={Results} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
