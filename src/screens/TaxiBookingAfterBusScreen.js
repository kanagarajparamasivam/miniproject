
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

  // Taxi Type State
  const [selectedTaxiType, setSelectedTaxiType] = useState('Mini');
  const taxiRates = {
    Mini: { base: 50, perKm: 15 },
    Sedan: { base: 70, perKm: 20 },
    SUV: { base: 100, perKm: 30 }
  };

  // Drop State
  const [addDrop, setAddDrop] = useState(true); // Default to true as per "Show Pickup Location" requirement
  const [dropDestination, setDropDestination] = useState(''); // User's final destination
  const [dropDistance, setDropDistance] = useState('');

  const [loading, setLoading] = useState(false);

  const calculateTotalFare = () => {
    let taxiTotal = 0;
    const rate = taxiRates[selectedTaxiType];

    if (addPickup && pickupDistance) taxiTotal += rate.base + (parseFloat(pickupDistance) * rate.perKm);
    if (addDrop && dropDistance) taxiTotal += rate.base + (parseFloat(dropDistance) * rate.perKm);

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
      // Aggregate payload for single API call
      const payload = {
        bookingId: currentBookingId,
        taxiType: selectedTaxiType, // Send selected type
        distance: 0 // Will be calc from pickup/drop
      };

      let totalDistance = 0;

      if (addPickup) {
        if (!pickupSource.trim() || !pickupDistance) {
          Alert.alert('Error', 'Please fill all Pickup details');
          setLoading(false);
          return;
        }
        payload.pickup = {
          source: pickupSource,
          destination: busSource,
          distance: parseFloat(pickupDistance)
        };
        totalDistance += parseFloat(pickupDistance);
      }

      if (addDrop) {
        if (!dropDestination.trim() || !dropDistance) {
          Alert.alert('Error', 'Please fill all Drop details');
          setLoading(false);
          return;
        }
        payload.drop = {
          source: busDestination,
          destination: dropDestination,
          distance: parseFloat(dropDistance)
        };
        totalDistance += parseFloat(dropDistance);
      }

      payload.distance = totalDistance;

      if (addPickup || addDrop) {
        const response = await hybridAPI.bookTaxi(payload);

        if (!response.success) {
          throw new Error(response.message || 'Failed to book taxi');
        }

        currentBookingId = response.data._id || response.bookingId;
        // Resulting booking should have totalFare updated
        currentTotalFare = response.data.totalFare || (busFare + (totalDistance * 15) + (addPickup ? 50 : 0) + (addDrop ? 50 : 0));
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

        {/* Vehicle Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            {['Mini', 'Sedan', 'SUV'].map((type) => (
              <TouchableOpacity
                key={type}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: selectedTaxiType === type ? '#4A90E2' : '#ddd',
                  backgroundColor: selectedTaxiType === type ? '#EBF5FF' : '#fff',
                  alignItems: 'center',
                  width: '30%'
                }}
                onPress={() => setSelectedTaxiType(type)}
              >
                <Ionicons name="car-sport" size={24} color={selectedTaxiType === type ? '#4A90E2' : '#555'} />
                <Text style={{ fontWeight: 'bold', marginTop: 5, color: '#333' }}>{type}</Text>
                <Text style={{ fontSize: 10, color: '#666' }}>₹{taxiRates[type].perKm}/km</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
              <Text style={styles.estimateText}>
                Est. Fare ({selectedTaxiType}): ₹{taxiRates[selectedTaxiType].base + (parseFloat(pickupDistance || 0) * taxiRates[selectedTaxiType].perKm)}
              </Text>
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
              <Text style={styles.estimateText}>
                Est. Fare ({selectedTaxiType}): ₹{taxiRates[selectedTaxiType].base + (parseFloat(dropDistance || 0) * taxiRates[selectedTaxiType].perKm)}
              </Text>
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
