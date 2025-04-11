import React from 'react';
import { View, TouchableOpacity } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; 

// Screens
import LoginScreen from './screen/LoginScreen';
import RegisterScreen from './screen/RegisterScreen';
import HomeScreen from './screen/HomeScreen';
import AddEventScreen from './screen/AddEventScreen';
import EditEventScreen from './screen/EditEventScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Registro' }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={({ navigation }) => ({
            title: 'MySmartAgenda',
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddEvent')}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="add" size={28} color="#007AFF" />
              </TouchableOpacity>
            )
          })}
        />
        <Stack.Screen 
          name="AddEvent" 
          component={AddEventScreen} 
          options={{ title: 'Nuevo Evento' }} 
        />
        <Stack.Screen 
          name="EditEvent" 
          component={EditEventScreen} 
          options={{ title: 'Editar Evento' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;