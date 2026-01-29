import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { myBookingsStyles as styles } from '../styles/myBookingsStyles';
import { getBookings } from '../services/api'; // We will need to export this from api.js

export default function MyBookingsScreen({ navigation, route }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = route.params?.userId || 'demo@example.com'; // Fallback for dev

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getBookings(userId);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#E3F9E5'; // Light Green
            case 'completed': return '#E3F2FD'; // Light Blue
            case 'cancelled': return '#FFEBEE'; // Light Red
            default: return '#F5F5F5';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#2E7D32';
            case 'completed': return '#1565C0';
            case 'cancelled': return '#C62828';
            default: return '#666';
        }
    };

    const getBorderColor = (type) => {
        switch (type) {
            case 'bus': return '#4A90E2';
            case 'taxi': return '#F5A623';
            case 'hybrid': return '#7E57C2';
            default: return '#999';
        }
    };

    const renderBookingItem = ({ item }) => {
        const isBus = item.bookingType === 'bus';
        const isHybrid = item.bookingType === 'hybrid';

        // Determine Source/Dest based on booking type
        let source = '';
        let destination = '';
        let details = [];

        if (item.busBooking) {
            source = item.busBooking.source;
            destination = item.busBooking.destination;
            details.push({ label: 'Seats', value: item.busBooking.seats?.join(', ') || 'N/A' });
            details.push({ label: 'Bus No', value: item.busBooking.routeNo || 'N/A' });
        } else if (item.pickupTaxi) {
            source = item.pickupTaxi.source;
            destination = item.pickupTaxi.destination;
            details.push({ label: 'Taxi', value: 'Pickup' });
        }

        if (isHybrid && item.pickupTaxi) {
            // Hybrid logic might require showing both legs? 
            // For now simpler view: Main journey source/dest
        }

        return (
            <View style={[styles.card, { borderLeftColor: getBorderColor(item.bookingType) }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>
                        {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.routeRow}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationLabel}>From</Text>
                        <Text style={styles.locationText}>{source}</Text>
                    </View>

                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={20} color="#CCC" />
                        <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{item.bookingType.toUpperCase()}</Text>
                    </View>

                    <View style={[styles.locationContainer, { alignItems: 'flex-end' }]}>
                        <Text style={styles.locationLabel}>To</Text>
                        <Text style={styles.locationText}>{destination}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Total Fare</Text>
                        <Text style={[styles.detailValue, { color: '#2E7D32' }]}>₹{item.totalFare}</Text>
                    </View>

                    {details.map((detail, index) => (
                        <View key={index} style={styles.detailItem}>
                            <Text style={styles.detailLabel}>{detail.label}</Text>
                            <Text style={styles.detailValue}>{detail.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1E3A5F', '#4A90E2']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <Text style={styles.headerSubtitle}>Your travel history</Text>
                </View>
            </LinearGradient>

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color="#DDD" />
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        renderItem={renderBookingItem}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>
        </View>
    );
}
