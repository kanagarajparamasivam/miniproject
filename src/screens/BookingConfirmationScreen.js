import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/bookingConfirmationStyles';

// Local styles override if needed, or edit the style file directly.
// Proceeding to edit the style file directly in next step.
export default function BookingConfirmationScreen({ route, navigation }) {
    const { bookingId, selectedSeats, totalFare, source, destination, routeNo, bookingDate } = route.params;

    const handleBackToHome = () => {
        // Navigate to root (Home)
        navigation.popToTop();
        // Or if Home is not in stack properly, navigate('RouteInput')
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#4CAF50', '#2E7D32']} // Green for success
                style={styles.headerGradient}
            >
                <Ionicons name="checkmark-circle" size={60} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Booking Confirmed!</Text>
                <Text style={styles.headerSubtitle}>Your seats have been reserved.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.card}>
                    <Text style={styles.label}>Booking ID</Text>
                    <Text style={styles.value}>{bookingId}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Route</Text>
                    <Text style={styles.value}>
                        {source} <Ionicons name="arrow-forward" size={16} /> {destination}
                    </Text>
                    <Text style={styles.label}>Bus Route No</Text>
                    <Text style={styles.value}>{routeNo}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Seats</Text>
                    <Text style={styles.value}>{selectedSeats.join(', ')}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Seats</Text>
                    <Text style={styles.value}>{selectedSeats.join(', ')}</Text>

                    {(route.params.pickupTaxi || route.params.dropTaxi) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionHeader}>Taxi Details</Text>

                            {route.params.pickupTaxi && (
                                <View style={styles.taxiRow}>
                                    <Text style={styles.label}>Pickup Taxi</Text>
                                    <Text style={styles.subValue}>
                                        {route.params.pickupTaxi.source} <Ionicons name="arrow-forward" size={12} /> {route.params.pickupTaxi.destination}
                                    </Text>
                                    <Text style={styles.subValue}>
                                        Time: {new Date(route.params.pickupTaxi.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={styles.subValue}>Fare: ₹{route.params.pickupTaxi.fare}</Text>
                                </View>
                            )}

                            {route.params.dropTaxi && (
                                <View style={styles.taxiRow}>
                                    <Text style={styles.label}>Drop Taxi</Text>
                                    <Text style={styles.subValue}>
                                        {route.params.dropTaxi.source} <Ionicons name="arrow-forward" size={12} /> {route.params.dropTaxi.destination}
                                    </Text>
                                    <Text style={styles.subValue}>
                                        Time: {new Date(route.params.dropTaxi.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={styles.subValue}>Fare: ₹{route.params.dropTaxi.fare}</Text>
                                </View>
                            )}
                        </>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.fareLabel}>Total Amount ({route.params.pickupTaxi || route.params.dropTaxi ? 'Bus + Taxi' : 'Bus'})</Text>
                        <Text style={styles.fareValue}>₹{totalFare}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={handleBackToHome}
                    activeOpacity={0.8}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                {/* Optional: Add "My Bookings" button if that screen exists */}
                {/*
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
        */}
            </ScrollView>
        </View>
    );
}
