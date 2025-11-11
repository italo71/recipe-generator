import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
      }}>
      
      {}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color: color, fontSize: focused ? 24 : 20 }}>🏠</Text>
          ),
        }}
      />

      {}
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color: color, fontSize: focused ? 24 : 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}