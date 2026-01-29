import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/routeInputStyles';
import { hybridAPI } from '../services/api';

export default function RouteInputScreen({ navigation }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};

    if (!source.trim()) {
      newErrors.source = 'Source location is required';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination location is required';
    }

    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      newErrors.destination = 'Source and destination must be different';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateInputs()) {
      return;
    }

    navigation.navigate('Results', {
      source: source.trim(),
      destination: destination.trim(),
    });
  };

  const quickLocations = [
    { name: 'Chennai', icon: 'location' },
    { name: 'Coimbatore', icon: 'business' },
    { name: 'Madurai', icon: 'star' },
    { name: 'Salem', icon: 'location' },
  ];

  const handleQuickSelect = (location, type) => {
    if (type === 'source') {
      setSource(location);
      setErrors({ ...errors, source: null });
    } else {
      setDestination(location);
      setErrors({ ...errors, destination: null });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={['#4A90E2', '#FFFFFF']}
          style={styles.headerGradient}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Plan Your Trip</Text>
              <Text style={styles.headerSubtitle}>
                Enter your source and destination
              </Text>
            </View>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <Ionicons name="receipt-outline" size={24} color="#1E3A5F" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Source Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>From</Text>
            <View style={[styles.inputWrapper, errors.source && styles.inputError]}>
              <Ionicons name="location" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter source location"
                placeholderTextColor="#999"
                value={source}
                onChangeText={(text) => {
                  setSource(text);
                  if (errors.source) setErrors({ ...errors, source: null });
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.source && (
              <Text style={styles.errorText}>{errors.source}</Text>
            )}
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            style={styles.swapButton}
            onPress={() => {
              const temp = source;
              setSource(destination);
              setDestination(temp);
            }}
          >
            <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Destination Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>To</Text>
            <View style={[styles.inputWrapper, errors.destination && styles.inputError]}>
              <Ionicons name="location" size={20} color="#E74C3C" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter destination location"
                placeholderTextColor="#999"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  if (errors.destination) setErrors({ ...errors, destination: null });
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.destination && (
              <Text style={styles.errorText}>{errors.destination}</Text>
            )}
          </View>

          {/* Quick Locations */}
          <View style={styles.quickLocationsSection}>
            <Text style={styles.quickLocationsTitle}>Quick Select</Text>
            <View style={styles.quickLocationsRow}>
              {quickLocations.map((location) => (
                <View key={location.name} style={styles.quickLocationGroup}>
                  <TouchableOpacity
                    style={styles.quickLocationButton}
                    onPress={() => handleQuickSelect(location.name, 'source')}
                  >
                    <Ionicons name={location.icon} size={18} color="#4A90E2" />
                    <Text style={styles.quickLocationText}>{location.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickLocationButton, styles.quickLocationButtonDest]}
                    onPress={() => handleQuickSelect(location.name, 'destination')}
                  >
                    <Ionicons name={location.icon} size={18} color="#E74C3C" />
                    <Text style={styles.quickLocationText}>{location.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
                <Text style={styles.searchButtonText}>Find Best Route</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Standalone Taxi Entry Point */}
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: '#2ECC71', marginTop: 15 }]}
            onPress={() => navigation.navigate('StandaloneTaxi')}
            activeOpacity={0.8}
          >
            <Ionicons name="car" size={20} color="#FFFFFF" style={styles.searchIcon} />
            <Text style={styles.searchButtonText}>Book Local Taxi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  );
}
