
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { hybridAPI } from '../services/api';

export default function PassengerInfoScreen({ route, navigation }) {
    const { bookingId, busBookingId, source, destination, busArrivalTime, busFare, totalFare, selectedSeats, boardingPoint, droppingPoint, needsLocalTaxi } = route.params;

    // Initialize passenger state based on selected seats
    const [passengers, setPassengers] = useState(
        selectedSeats.map(seat => ({
            seat,
            name: '',
            age: '',
            gender: '', // 'Male', 'Female', 'Other'
            idProof: '',
            email: '',
            mobile: ''
        }))
    );

    const [loading, setLoading] = useState(false);

    const updatePassenger = (index, field, value) => {
        const updatedPassengers = [...passengers];
        updatedPassengers[index][field] = value;
        setPassengers(updatedPassengers);
    };

    const validateForm = () => {
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.name || !p.age || !p.gender || !p.mobile) {
                Alert.alert(`Missing Details`, `Please fill all required details for Seat ${p.seat}`);
                return false;
            }
            if (isNaN(p.age)) {
                Alert.alert('Invalid Age', `Please enter a valid age for Seat ${p.seat}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log('Submitting passenger details for booking:', bookingId);

            // Format payload to match backend expectation if needed
            const payload = {
                bookingId,
                passengers: passengers.map(p => ({
                    seat: p.seat,
                    name: p.name,
                    age: parseInt(p.age),
                    gender: p.gender,
                    idProof: p.idProof,
                    email: p.email,
                    mobile: p.mobile
                }))
            };

            const response = await hybridAPI.submitPassengerDetails(payload);

            if (response.success) {
                console.log('Passenger details saved. Prompting for taxi...');

                console.log('Passenger details saved. Checking taxi preference:', needsLocalTaxi);

                if (needsLocalTaxi) {
                    // User requested taxi earlier: Go to Taxi Booking Screen
                    navigation.navigate('TaxiBookingAfterBus', {
                        bookingId,
                        busBookingId,
                        source,
                        destination,
                        busArrivalTime,
                        busFare,
                        totalFare, // Pass through, but will be recalculated there
                    });
                } else {
                    // User skipped taxi earlier: Go straight to Payment with BUS FARE ONLY
                    navigation.navigate('Payment', {
                        bookingId,
                        totalFare: busFare, // Only pay proper bus fare
                        bookingType: 'bus',
                        busFare: busFare,
                        taxiFare: 0
                    });
                }
            } else {
                Alert.alert('Error', response.message || 'Failed to save passenger details');
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to connect to server');
            console.error('Passenger Submit Error:', error);
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
                <Text style={styles.headerTitle}>Passenger Details</Text>
                <Text style={styles.headerSubtitle}>Booking ID: {bookingId ? bookingId.slice(-6).toUpperCase() : 'PENDING'}</Text>
            </LinearGradient>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Route</Text>
                        <Text style={styles.summaryValue}>{source} → {destination}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Boarding</Text>
                        <Text style={styles.summaryValue}>{boardingPoint?.name}</Text>
                        <Text style={styles.summarySubValue}>{boardingPoint?.time}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Dropping</Text>
                        <Text style={styles.summaryValue}>{droppingPoint?.name}</Text>
                        <Text style={styles.summarySubValue}>{droppingPoint?.time}</Text>
                    </View>
                </View>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Seats</Text>
                        <Text style={styles.summaryValue}>{selectedSeats.join(', ')}</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content}>
                    {passengers.map((p, index) => (
                        <View key={p.seat} style={styles.passengerCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="person" size={20} color="#4A90E2" />
                                <Text style={styles.seatLabel}>Seat {p.seat}</Text>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputGroupFull}>
                                    <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        value={p.name}
                                        onChangeText={(text) => updatePassenger(index, 'name', text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputGroupHalf}>
                                    <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Age"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={p.age}
                                        onChangeText={(text) => updatePassenger(index, 'age', text)}
                                    />
                                </View>
                                <View style={styles.inputGroupHalf}>
                                    <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="M/F"
                                        value={p.gender}
                                        onChangeText={(text) => updatePassenger(index, 'gender', text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputGroupFull}>
                                    <Text style={styles.label}>Mobile Number <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit Mobile"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={p.mobile}
                                        onChangeText={(text) => updatePassenger(index, 'mobile', text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputGroupFull}>
                                    <Text style={styles.label}>Email (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        keyboardType="email-address"
                                        value={p.email}
                                        onChangeText={(text) => updatePassenger(index, 'email', text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputGroupFull}>
                                    <Text style={styles.label}>ID Proof (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Aadhaar / Passport / License"
                                        value={p.idProof}
                                        onChangeText={(text) => updatePassenger(index, 'idProof', text)}
                                    />
                                </View>
                            </View>

                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Continue to Taxi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E3A5F',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#1E3A5F',
        opacity: 0.8,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    passengerCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    seatLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginLeft: 10,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    inputGroupFull: {
        flex: 1,
    },
    inputGroupHalf: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: '500',
    },
    required: {
        color: 'red',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 10,
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: '#FFF',
        margin: 15,
        marginTop: -20,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    summarySubValue: {
        fontSize: 12,
        color: '#666',
    },
});
