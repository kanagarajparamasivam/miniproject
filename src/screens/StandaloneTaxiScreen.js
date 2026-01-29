
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/taxiBookingStyles';
import { bookingAPI } from '../services/api';

export default function StandaloneTaxiScreen({ navigation }) {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [distance, setDistance] = useState('');
    const [loading, setLoading] = useState(false);

    const calculateFare = () => {
        if (!distance) return 0;
        return 50 + (parseFloat(distance) * 15);
    };

    const handleBook = async () => {
        if (!source.trim() || !destination.trim() || !distance) {
            Alert.alert('Error', 'Please fill all details');
            return;
        }

        const distVal = parseFloat(distance);
        if (distVal > 50) {
            Alert.alert('Limit Exceeded', 'Local taxi is only available for distances up to 50km.');
            return;
        }

        setLoading(true);
        try {
            // In a real app authentication would be handled via context
            const userId = 'demo@example.com';

            const response = await bookingAPI.bookTaxiOnly({
                userId,
                source,
                destination,
                distance: distVal,
            });

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Taxi Booked Successfully!',
                    [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]
                );
            } else {
                Alert.alert('Error', response.message || 'Failed to book taxi');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to server');
            console.error('Taxi booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
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
                <Text style={styles.headerTitle}>Local Taxi</Text>
                <Text style={styles.headerSubtitle}>Book a quick ride nearby</Text>
            </LinearGradient>

            <ScrollView style={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Pickup Location</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location" size={20} color="#4A90E2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter pickup location"
                                value={source}
                                onChangeText={setSource}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Drop Location</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location" size={20} color="#E74C3C" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter drop location"
                                value={destination}
                                onChangeText={setDestination}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Distance (km)</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="speedometer" size={20} color="#4A90E2" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ex: 5"
                                keyboardType="numeric"
                                value={distance}
                                onChangeText={setDistance}
                            />
                        </View>
                    </View>

                    {distance && !isNaN(distance) && (
                        <View style={styles.fareEstimate}>
                            <Text style={styles.fareEstimateLabel}>Estimated Fare:</Text>
                            <Text style={styles.fareEstimateValue}>₹{calculateFare()}</Text>
                        </View>
                    )}

                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, (!source || !destination || !distance) && styles.bookButtonDisabled]}
                    onPress={handleBook}
                    disabled={loading || !source || !destination || !distance}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
