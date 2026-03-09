import 'react-native-get-random-values';
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 }}>
          <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>App Error:</Text>
          <Text style={{ color: 'white', fontSize: 13 }}>{String(this.state.error)}</Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 10 }}>{this.state.error?.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
import AuthPage from './src/screens/AuthPage';
import GameHub from './src/screens/GameHub';
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
import AksharaGame from './src/screens/AksharaGame';
import Results from './src/screens/Results';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="AuthPage"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="AuthPage" component={AuthPage} />
        <Stack.Screen name="GameHub" component={GameHub} />
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
        <Stack.Screen name="AksharaGame" component={AksharaGame} />
        <Stack.Screen name="Results" component={Results} />
      </Stack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
}
