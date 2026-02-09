import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/resultsStyles';
import { busAPI } from '../services/api';

export default function ResultsScreen({ route, navigation }) {
  const { source, destination } = route.params;
  const [loading, setLoading] = useState(true);
  const [busList, setBusList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusRoutes();
  }, []);

  const fetchBusRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      setBusList([]);

      console.log(`Fetching bus options for ${source} -> ${destination}`);

      // STRICT FLOW: Fetch Bus Options ONLY
      const response = await busAPI.getBusOptions(source, destination);
      console.log('Bus API Response:', JSON.stringify(response));

      if (response && response.success) {
        if (response.data && response.data.length > 0) {
          setBusList(response.data);
        } else {
          // Success but empty list (No buses found)
          setBusList([]);
        }
      } else {
        // API returned success: false with a message
        setError(response?.message || 'Failed to fetch bus options');
      }
    } catch (err) {
      console.error('Error in ResultsScreen:', err);
      // SHOW REAL ERROR - do not mask it with "Connection failed"
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    // timeStr is usually HH:MM, format to 12h
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleBookBus = (bus) => {
    navigation.navigate('BusSeatSelection', {
      busId: bus._id,
      routeNo: bus.routeNo,
      source: bus.source,
      destination: bus.destination,
      fare: bus.fare,
      departureTime: formatTime(bus.departureTime),
      arrivalTime: formatTime(bus.arrivalTime),
      operator: bus.operator, // Pass operator name
    });
  };

  const BusCard = ({ bus }) => (
    <View style={styles.optionCard}>
      <View style={styles.optionHeader}>
        <View>
          <Text style={styles.optionTitle}>{bus.operator || 'Bus Operator'}</Text>
          <Text style={styles.detailText}>{bus.type || 'Standard Bus'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.optionTitle}>₹{bus.fare}</Text>
          <Text style={[styles.detailText, { color: bus.seatAvailable ? '#2ECC71' : '#E74C3C' }]}>
            {bus.availableSeats} Seats Left
          </Text>
        </View>
      </View>

      <View style={styles.optionDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#999" />
          <Text style={styles.detailText}>
            {Math.floor(bus.eta / 60)}h {bus.eta % 60}m
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookOptionButton}
        onPress={() => handleBookBus(bus)}
        activeOpacity={0.8}
        disabled={!bus.seatAvailable}
      >
        <Text style={styles.bookOptionButtonText}>
          {bus.seatAvailable ? 'Select Seats' : 'Sold Out'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Select Bus</Text>
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>{source}</Text>
          <Ionicons name="arrow-forward" size={16} color="#666" style={{ marginHorizontal: 10 }} />
          <Text style={styles.routeText}>{destination}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>{error}</Text>
          <TouchableOpacity onPress={fetchBusRoutes} style={{ marginTop: 20 }}>
            <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={busList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BusCard bus={item} />}
          contentContainerStyle={styles.scrollContent}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>No buses found for this route.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
