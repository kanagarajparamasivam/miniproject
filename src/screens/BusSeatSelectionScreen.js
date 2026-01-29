import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/busSeatSelectionStyles';
import { bookingAPI, hybridAPI } from '../services/api';

export default function BusSeatSelectionScreen({ route, navigation }) {
  const { busId, routeNo, source, destination, fare, departureTime, arrivalTime, isHybrid, taxiFare } = route.params;
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchBusDetails();
  }, []);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBusDetails(busId);
      if (response.success) {
        setSeats(response.data.seats || []);
      } else {
        Alert.alert('Error', 'Failed to load bus details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error('Error fetching bus details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seatNumber) => {
    // ... logic ...
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (seat && seat.isBooked) {
      Alert.alert('Seat Unavailable', 'This seat is already booked');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat');
      return;
    }

    // For now, use demo user ID - in real app, get from auth context
    const userId = 'demo@example.com';

    console.log('Starting booking process...');
    setBookingLoading(true);
    try {
      const response = await bookingAPI.bookBus({
        userId,
        busId,
        routeId: routeNo, // Pass routeId for backend lookup if needed
        from: source,
        to: destination,
        seats: selectedSeats,
        fare: fare, // Unit fare, or calculate total in backend
        bookingDate: new Date().toISOString(),
      });
      console.log('Booking response:', response);

      if (response.success) {
        const bookingId = response.data._id;
        const totalFare = fare * selectedSeats.length; // Use calculation for display/passing
        console.log('Booking successful. Booking ID:', bookingId);

        // HYBRID FLOW
        if (isHybrid) {
          // Changed: Call Hybrid Specific API to book bus FIRST
          console.log('Hybrid Flow: Booking bus seat first...');
          const hybridResponse = await hybridAPI.bookBus({
            userId,
            routeId: routeNo,
            seats: selectedSeats,
            from: source,
            to: destination,
            journeyType: 'HYBRID',
            fare: fare
          });

          if (hybridResponse.success) {
            console.log('Hybrid Bus Booking Success:', hybridResponse.bookingId);
            navigation.navigate('TaxiBookingAfterBus', {
              bookingId: hybridResponse.bookingId,
              busBookingId: hybridResponse.bookingId,
              source: source,
              destination: destination,
              busArrivalTime: arrivalTime,
              busFare: totalFare,
              totalFare: totalFare,
            });
          } else {
            Alert.alert('Booking Failed', hybridResponse.message || 'Failed to book bus leg');
          }
          return;
        }

        // BUS-ONLY FLOW
        // Ask if they want to add a taxi leg
        Alert.alert(
          'Booking Successful!',
          'Do you want to add a last-mile taxi?',
          [
            {
              text: 'No, Finish Booking',
              style: 'cancel',
              onPress: () => {
                // Navigate directly to Confirmation as per requirements
                navigation.navigate('BookingConfirmation', {
                  bookingId,
                  selectedSeats,
                  totalFare,
                  source,
                  destination,
                  routeNo,
                  bookingDate: new Date().toISOString()
                });
              },
            },
            {
              text: 'Yes, Add Taxi',
              onPress: () => {
                navigation.navigate('TaxiBookingAfterBus', {
                  bookingId,
                  busBookingId: bookingId,
                  source: source,
                  destination: destination,
                  busArrivalTime: arrivalTime,
                  busFare: totalFare,
                  totalFare: totalFare,
                });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        console.log('Booking failed:', response.message);
        // Handle specific unavailable seats
        if (response.unavailableSeats && response.unavailableSeats.length > 0) {
          Alert.alert('Seats Unavailable', `The following seats are already booked: ${response.unavailableSeats.join(', ')}. Please select others.`);
          // Refresh seat availability
          fetchBusDetails();
          // Unselect unavailable seats
          setSelectedSeats(prev => prev.filter(s => !response.unavailableSeats.includes(s)));
        } else {
          Alert.alert('Booking Failed', response.message || 'Failed to book bus');
        }
      }
    } catch (error) {
      console.error('CRITICAL: Booking error in handleContinue:', error);
      Alert.alert('Booking Error', 'Failed to process booking. Check your connection or server logs.\n\nDetails: ' + error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const renderSeatLayout = () => {
    // Organize seats in rows (2-3-2 pattern common in buses)
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      rows.push(seats.slice(i, i + 4));
    }

    return (
      <View style={styles.seatLayout}>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.availableSeat]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.selectedSeat]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.bookedSeat]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>

        {/* Seat Grid */}
        <ScrollView style={styles.seatGrid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.seatRow}>
              {/* Left side seats (2 seats) */}
              <View style={styles.seatGroup}>
                {row.slice(0, 2).map((seat) => {
                  const isSelected = selectedSeats.includes(seat.seatNumber);
                  const isBooked = seat.isBooked;
                  return (
                    <TouchableOpacity
                      key={seat.seatNumber}
                      style={[
                        styles.seat,
                        isSelected && styles.selectedSeat,
                        isBooked && styles.bookedSeat,
                        isBooked && styles.seatDisabled,
                      ]}
                      onPress={() => toggleSeatSelection(seat.seatNumber)}
                      disabled={isBooked}
                    >
                      <Text
                        style={[
                          styles.seatText,
                          isSelected && styles.selectedSeatText,
                          isBooked && styles.bookedSeatText,
                        ]}
                      >
                        {seat.seatNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Aisle */}
              <View style={styles.aisle} />

              {/* Right side seats (2 seats) */}
              <View style={styles.seatGroup}>
                {row.slice(2, 4).map((seat) => {
                  const isSelected = selectedSeats.includes(seat.seatNumber);
                  const isBooked = seat.isBooked;
                  return (
                    <TouchableOpacity
                      key={seat.seatNumber}
                      style={[
                        styles.seat,
                        isSelected && styles.selectedSeat,
                        isBooked && styles.bookedSeat,
                        isBooked && styles.seatDisabled,
                      ]}
                      onPress={() => toggleSeatSelection(seat.seatNumber)}
                      disabled={isBooked}
                    >
                      <Text
                        style={[
                          styles.seatText,
                          isSelected && styles.selectedSeatText,
                          isBooked && styles.bookedSeatText,
                        ]}
                      >
                        {seat.seatNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading seat layout...</Text>
      </View>
    );
  }

  const totalFare = fare * selectedSeats.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#FFFFFF']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Seats</Text>
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>{source}</Text>
          <Ionicons name="arrow-forward" size={16} color="#666" style={{ marginHorizontal: 10 }} />
          <Text style={styles.routeText}>{destination}</Text>
        </View>
        <Text style={styles.routeNo}>Route: {routeNo}</Text>
        <Text style={styles.timeInfo}>Departure: {departureTime} | Arrival: {arrivalTime}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>
        {renderSeatLayout()}
      </ScrollView>

      {/* Footer with booking info */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Selected Seats:</Text>
          <Text style={styles.footerValue}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </Text>
        </View>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Fare:</Text>
          <Text style={styles.footerFare}>₹{totalFare}</Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, selectedSeats.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={selectedSeats.length === 0 || bookingLoading}
          activeOpacity={0.8}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue to Booking</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

