import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConfigScreen from '../screens/ConfigScreen';
import RemoteScreen from '../screens/RemoteScreen';

// Définition des écrans et leurs paramètres
export type RootStackParamList = {
  Config: undefined;
  Remote: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Config"
        screenOptions={{
          headerShown: false,        // On gère notre propre header
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0f0f1a' },
        }}
      >
        <Stack.Screen name="Config" component={ConfigScreen} />
        <Stack.Screen name="Remote" component={RemoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;