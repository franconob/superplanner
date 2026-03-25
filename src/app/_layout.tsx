import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="inbox" />
          <Stack.Screen name="favourites" />
          <Stack.Screen name="past-due" />
          <Stack.Screen name="add-task" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="select-parent-task" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="new-list" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="task-list" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="add-activity" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="activity-list" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
