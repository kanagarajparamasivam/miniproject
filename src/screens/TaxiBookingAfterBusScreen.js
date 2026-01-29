
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/taxiBookingStyles';
import { bookingAPI, hybridAPI } from '../services/api';

export default function TaxiBookingAfterBusScreen({ route, navigation }) {
  const { bookingId, busBookingId, source: busSource, destination: busDestination, busArrivalTime, busFare, totalFare: initialTotalFare } = route.params;

  // Pickup State
  const [addPickup, setAddPickup] = useState(false);
  const [pickupSource, setPickupSource] = useState(''); // User's location
  const [pickupDistance, setPickupDistance] = useState('');

  // Drop State
  const [addDrop, setAddDrop] = useState(false);
  const [dropDestination, setDropDestination] = useState(''); // User's final destination
  const [dropDistance, setDropDistance] = useState('');

  const [loading, setLoading] = useState(false);

  const calculateTotalFare = () => {
    let taxiTotal = 0;
    if (addPickup && pickupDistance) taxiTotal += 50 + (parseFloat(pickupDistance) * 15);
    if (addDrop && dropDistance) taxiTotal += 50 + (parseFloat(dropDistance) * 15);
    return busFare + taxiTotal;
  };

  const handleConfirm = async () => {
    if (!addPickup && !addDrop) {
      // Just proceed to payment with Bus only
      navigation.navigate('Payment', {
        bookingId: busBookingId, // Original Bus Booking ID
        totalFare: busFare,
        bookingType: 'bus',
        busFare: busFare,
        taxiFare: 0,
      });
      return;
    }

    setLoading(true);
    let currentBookingId = busBookingId;
    let currentTotalFare = busFare;
    let totalTaxiFare = 0;

    try {
      // 1. Process Pickup Taxi if selected
      if (addPickup) {
        if (!pickupSource.trim() || !pickupDistance) {
          Alert.alert('Error', 'Please fill all Pickup details');
          setLoading(false);
          return;
        }

        const response = await hybridAPI.bookTaxi({
          bookingId: currentBookingId,
          pickup: {
            source: pickupSource, // User Loc
            destination: busSource, // Bus Source
            distance: parseFloat(pickupDistance)
          },
          taxiType: 'pickup'
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to add Pickup Taxi');
        }
        currentBookingId = response.data._id || response.bookingId;
        // Update fare tracking
        currentTotalFare = response.data.totalFare || response.data.booking.totalFare; // Adapt based on backend response structure
      }

      // 2. Process Drop Taxi if selected
      if (addDrop) {
        if (!dropDestination.trim() || !dropDistance) {
          Alert.alert('Error', 'Please fill all Drop details');
          setLoading(false);
          return;
        }

        const response = await hybridAPI.bookTaxi({
          bookingId: currentBookingId,
          drop: {
            source: busDestination,
            destination: dropDestination,
            distance: parseFloat(dropDistance)
          },
          taxiType: 'drop'
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to add Drop Taxi');
        }
        currentBookingId = response.data._id || response.bookingId;
        currentTotalFare = response.data.totalFare || response.data.booking.totalFare;
      }

      // Success - Navigate to Payment
      navigation.navigate('Payment', {
        bookingId: currentBookingId,
        totalFare: currentTotalFare,
        bookingType: 'hybrid',
        busFare: busFare,
        taxiFare: currentTotalFare - busFare,
      });

    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process taxi booking');
      console.error('Taxi booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#FFFFFF']} style={styles.headerGradient}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Your Trip</Text>
        <Text style={styles.headerSubtitle}>Bus Route: {busSource} → {busDestination}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>

        {/* Pickup Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pickup Taxi (To Bus Stand)</Text>
            <Switch value={addPickup} onValueChange={setAddPickup} trackColor={{ false: "#767577", true: "#4A90E2" }} />
          </View>

          {addPickup && (
            <View style={styles.formContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>From (Your Location)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter pickup location"
                  value={pickupSource}
                  onChangeText={setPickupSource}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>To (Bus Boarding Point)</Text>
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledText}>{busSource}</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Distance (km)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 10"
                  keyboardType="numeric"
                  value={pickupDistance}
                  onChangeText={setPickupDistance}
                />
              </View>
              <Text style={styles.estimateText}>Est. Fare: ₹{50 + (parseFloat(pickupDistance || 0) * 15)}</Text>
            </View>
          )}
        </View>

        {/* Drop Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drop Taxi (From Bus Stand)</Text>
            <Switch value={addDrop} onValueChange={setAddDrop} trackColor={{ false: "#767577", true: "#4A90E2" }} />
          </View>

          {addDrop && (
            <View style={styles.formContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>From (Bus Drop Point)</Text>
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledText}>{busDestination}</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>To (Final Destination)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter drop location"
                  value={dropDestination}
                  onChangeText={setDropDestination}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Distance (km)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 10"
                  keyboardType="numeric"
                  value={dropDistance}
                  onChangeText={setDropDistance}
                />
              </View>
              <Text style={styles.estimateText}>Est. Fare: ₹{50 + (parseFloat(dropDistance || 0) * 15)}</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Trip Fare:</Text>
          <Text style={styles.footerFare}>₹{calculateTotalFare()}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : (
            <Text style={styles.bookButtonText}>
              {(!addPickup && !addDrop) ? "Skip Taxi & Pay" : "Confirm & Pay"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
