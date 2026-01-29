import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RouteInputScreen from './src/screens/RouteInputScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import BusSeatSelectionScreen from './src/screens/BusSeatSelectionScreen';
import TaxiBookingAfterBusScreen from './src/screens/TaxiBookingAfterBusScreen';
import StandaloneTaxiScreen from './src/screens/StandaloneTaxiScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RouteInput" component={RouteInputScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="BusSeatSelection" component={BusSeatSelectionScreen} />
          <Stack.Screen name="TaxiBookingAfterBus" component={TaxiBookingAfterBusScreen} />
          <Stack.Screen name="StandaloneTaxi" component={StandaloneTaxiScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

