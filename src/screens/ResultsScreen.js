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
import { styles } from '../styles/resultsStyles';
import { hybridAPI } from '../services/api';

export default function ResultsScreen({ route, navigation }) {
  const { source, destination } = route.params;
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      const response = await hybridAPI.getHybridRecommendation(source, destination);

      if (response.success) {
        setRecommendation(response.data);
        if (response.message && response.message.includes('Offline')) {
          setIsOffline(true);
        }
      } else {
        // Even if success is false, check if we have data (fallback)
        if (response.data) {
          setRecommendation(response.data);
          setIsOffline(true);
        } else {
          setError(response.message || 'Failed to fetch routes');
          Alert.alert('Error', response.message || 'Failed to fetch routes');
        }
      }
    } catch (err) {
      // Should be caught by api.js fallback, but just in case
      console.log('Error in ResultsScreen:', err);
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatCurrency = (amount) => {
    return `₹${amount}`;
  };

  const handleBook = async (optionType, breakdown) => {
    if (optionType === 'Bus') {
      // Navigate to bus seat selection
      navigation.navigate('BusSeatSelection', {
        busId: breakdown?.bus?.busId,
        routeNo: breakdown?.bus?.routeNo,
        source,
        destination,
        fare: recommendation.allOptions.busOnly.fare,
        departureTime: breakdown?.bus?.departureTime,
        arrivalTime: breakdown?.bus?.arrivalTime,
      });
    } else if (optionType === 'Taxi') {
      // Navigate to taxi booking - for now just show alert as taxi-only booking screen not created
      Alert.alert(
        'Taxi Booking',
        'Direct taxi booking feature coming soon. Please use Bus or Hybrid option.',
        [{ text: 'OK' }]
      );
    } else if (optionType === 'Hybrid') {
      // Navigate to bus seat selection first, then taxi
      navigation.navigate('BusSeatSelection', {
        busId: breakdown?.hybrid?.busId,
        routeNo: breakdown?.hybrid?.routeNo,
        source,
        destination,
        fare: breakdown?.hybrid?.busFare,
        departureTime: breakdown?.hybrid?.departureTime,
        arrivalTime: breakdown?.hybrid?.arrivalTime,
        isHybrid: true,
        taxiFare: breakdown?.hybrid?.taxiFare,
      });
    }
  };

  const OptionCard = ({ title, fare, eta, available, isRecommended, breakdown, optionType }) => (
    <View style={[styles.optionCard, isRecommended && styles.recommendedCard]}>
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{title}</Text>
        {!available && (
          <Text style={styles.unavailableText}>Not Available</Text>
        )}
      </View>

      {available ? (
        <>
          <View style={styles.optionDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{formatTime(eta)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{formatCurrency(fare)}</Text>
            </View>
          </View>

          {breakdown && (
            <View style={styles.breakdownContainer}>
              {breakdown.bus && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Bus:</Text>
                  <Text style={styles.breakdownValue}>
                    Route {breakdown.bus.routeNo} - {formatCurrency(breakdown.bus.fare)} ({formatTime(breakdown.bus.eta)})
                  </Text>
                </View>
              )}
              {breakdown.taxi && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Taxi:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(breakdown.taxi.fare)} ({formatTime(breakdown.taxi.eta)})
                  </Text>
                </View>
              )}
              {breakdown.hybrid && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Hybrid:</Text>
                  <Text style={styles.breakdownValue}>
                    Bus: {formatCurrency(breakdown.hybrid.busFare)} + Taxi: {formatCurrency(breakdown.hybrid.taxiFare)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.bookOptionButton}
            onPress={() => handleBook(optionType, breakdown)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookOptionButtonText}>Book {optionType}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.unavailableMessage}>This option is not available for this route</Text>
      )}
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
        <Text style={styles.headerTitle}>Route Options</Text>
        <View style={styles.routeInfo}>
          <View style={styles.routeItem}>
            <Ionicons name="location" size={16} color="#4A90E2" />
            <Text style={styles.routeText}>{source}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#666" />
          <View style={styles.routeItem}>
            <Ionicons name="location" size={16} color="#E74C3C" />
            <Text style={styles.routeText}>{destination}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Offline Banner */}
      {isOffline && (
        <View style={{ backgroundColor: '#FF9800', padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="cloud-offline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Using offline route data</Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ marginTop: 15, color: '#666' }}>Finding best routes...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#333', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={[styles.bookOptionButton, { marginTop: 20, width: 150 }]}
            onPress={fetchRoutes}
          >
            <Text style={styles.bookOptionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : recommendation ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recommended Option Highlight */}
          <View style={styles.recommendationBanner}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <View style={styles.recommendationTextContainer}>
              <Text style={styles.recommendationTitle}>
                Best Option: {recommendation.recommendedOption}
              </Text>
              <Text style={styles.recommendationSubtitle}>
                {formatCurrency(recommendation.totalFare)} • {formatTime(recommendation.totalETA)}
              </Text>
            </View>
          </View>

          {/* All Options */}
          <View style={styles.optionsContainer}>
            <OptionCard
              title="Bus Only"
              fare={recommendation.allOptions.busOnly.fare}
              eta={recommendation.allOptions.busOnly.eta}
              available={recommendation.allOptions.busOnly.available}
              isRecommended={recommendation.recommendedOption === 'Bus'}
              breakdown={recommendation.breakdown?.bus ? { bus: recommendation.breakdown.bus } : null}
              optionType="Bus"
            />

            <OptionCard
              title="Taxi Only"
              fare={recommendation.allOptions.taxiOnly.fare}
              eta={recommendation.allOptions.taxiOnly.eta}
              available={recommendation.allOptions.taxiOnly.available}
              isRecommended={recommendation.recommendedOption === 'Taxi'}
              breakdown={recommendation.breakdown?.taxi ? { taxi: recommendation.breakdown.taxi } : null}
              optionType="Taxi"
            />

            <OptionCard
              title="Hybrid (Bus + Taxi)"
              fare={recommendation.allOptions.hybrid.fare}
              eta={recommendation.allOptions.hybrid.eta}
              available={recommendation.allOptions.hybrid.available}
              isRecommended={recommendation.recommendedOption === 'Hybrid'}
              breakdown={recommendation.breakdown?.hybrid ? { hybrid: recommendation.breakdown.hybrid } : null}
              optionType="Hybrid"
            />
          </View>

          {/* Back Button */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.backButtonSecondary}
              onPress={() => navigation.navigate('RouteInput')}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Search Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}


