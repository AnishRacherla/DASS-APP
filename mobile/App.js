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
import BubbleShooterSelection from './src/screens/BubbleShooterSelection';
import BubbleShooterGame from './src/screens/BubbleShooterGame';
import WordSortingBasketSelection from './src/screens/WordSortingBasketSelection';
import WordSortingBasketGame from './src/screens/WordSortingBasketGame';
import AksharaGame from './src/screens/AksharaGame';
import VarnamalGame from './src/screens/VarnamalGame';
import Results from './src/screens/Results';
import Dashboard from './src/screens/Dashboard';
import MatraGame from './src/screens/MatraGame';
import WordJumbleSelection from './src/screens/WordJumbleSelection';
import WordJumbleGame from './src/screens/WordJumbleGame';

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
        <Stack.Screen name="BubbleShooterSelection" component={BubbleShooterSelection} />
        <Stack.Screen name="BubbleShooterGame" component={BubbleShooterGame} />
        <Stack.Screen name="WordSortingBasketSelection" component={WordSortingBasketSelection} />
        <Stack.Screen name="WordSortingBasketGame" component={WordSortingBasketGame} />
        <Stack.Screen name="AksharaGame" component={AksharaGame} />
        <Stack.Screen name="VarnamalGame" component={VarnamalGame} />
        <Stack.Screen name="Results" component={Results} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="MatraGame" component={MatraGame} />
        <Stack.Screen name="WordJumbleSelection" component={WordJumbleSelection} />
        <Stack.Screen name="WordJumbleGame" component={WordJumbleGame} />
      </Stack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
}
