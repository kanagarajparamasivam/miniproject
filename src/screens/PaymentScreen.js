import React, { useState } from 'react';
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
import { styles } from '../styles/paymentStyles';
import { bookingAPI } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { bookingId, totalFare, bookingType, busFare, taxiFare } = route.params;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: 'phone-portrait', color: '#4A90E2' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'card', color: '#E74C3C' },
    { id: 'netbanking', name: 'Net Banking', icon: 'business', color: '#27AE60' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet', color: '#F39C12' },
    { id: 'cash', name: 'Cash / Pay at Boarding', icon: 'cash', color: '#9B59B6' },
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would integrate with payment gateway or handle COD.
      // For now, we'll simulate payment success for all methods (including Cash).
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await bookingAPI.processPayment({
        bookingId,
        paymentMethod: selectedPaymentMethod,
        paymentId,
      });

      if (response.success) {
        Alert.alert(
          'Payment Successful!',
          `Your booking has been confirmed. Booking ID: ${bookingId.substring(0, 8)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                const bookingData = response.data;
                // Navigate to booking confirmation
                navigation.navigate('BookingConfirmation', {
                  bookingId: bookingData._id,
                  bookingType: bookingData.bookingType,
                  totalFare: bookingData.totalFare,

                  // Bus Details
                  source: bookingData.busBooking?.source,
                  destination: bookingData.busBooking?.destination,
                  routeNo: bookingData.busBooking?.routeNo,
                  bookingDate: bookingData.busBooking?.bookingDate,
                  selectedSeats: bookingData.busBooking?.seats || [],
                  busFare: bookingData.busBooking?.fare,

                  // Taxi Details (if any)
                  pickupTaxi: bookingData.pickupTaxi,
                  dropTaxi: bookingData.dropTaxi,
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', response.message || 'Failed to process payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Payment</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          {bookingType === 'hybrid' && busFare && taxiFare && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bus Fare:</Text>
                <Text style={styles.summaryValue}>₹{busFare}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxi Fare:</Text>
                <Text style={styles.summaryValue}>₹{taxiFare}</Text>
              </View>
              <View style={styles.summaryDivider} />
            </>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryTotal}>₹{totalFare}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsCard}>
          <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={[styles.paymentMethodIcon, { backgroundColor: `${method.color}20` }]}>
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </View>
              {selectedPaymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={16} color="#666" />
          <Text style={styles.securityText}>
            Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Amount to Pay:</Text>
          <Text style={styles.footerAmount}>₹{totalFare}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, !selectedPaymentMethod && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay Now</Text>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

