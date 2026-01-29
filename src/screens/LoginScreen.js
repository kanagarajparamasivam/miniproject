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
import { styles } from '../styles/loginStyles';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await authAPI.login(email, password);
        
        if (response.success) {
          // Navigate to route input screen on successful login
          navigation.replace('RouteInput');
        } else {
          Alert.alert('Login Failed', response.message || 'Invalid credentials');
        }
      } catch (error) {
        Alert.alert('Login Error', error?.message || 'Login failed. Please try again.');
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUseDemoAccount = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setErrors({});
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // Navigate to forgot password screen
  };

  const handleSkipLogin = () => {
    // Demo-only: allow user to bypass login and see the rest of the flow
    navigation.replace('RouteInput');
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
    // Navigate to sign up screen
  };

  const handleGetStarted = () => {
    console.log('Get started pressed');
    // Navigate to onboarding or sign up
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#4A90E2', '#FFFFFF']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="bus" size={32} color="#1E3A5F" />
              <Ionicons name="car" size={24} color="#1E3A5F" style={styles.taxiIcon} />
            </View>
            <Text style={styles.appName}>Bus & Taxi Booking</Text>
          </View>
        </LinearGradient>

        {/* Hero / Welcome Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Travel Made Simple</Text>
          <Text style={styles.heroSubtitle}>
            Book bus tickets and taxi rides with ease. Fast, reliable, and affordable transportation solutions.
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginTextButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Text style={styles.loginTextButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Card Section */}
        <View style={styles.loginCard}>
          <Text style={styles.loginCardTitle}>Sign in to your account</Text>
          <Text style={styles.loginCardSubtitle}>Or create a new account</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Skip Login (Demo) */}
          <TouchableOpacity
            style={[styles.loginTextButton, { marginTop: 12 }]}
            onPress={handleSkipLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginTextButtonText}>Skip Login (Demo)</Text>
          </TouchableOpacity>

          {/* Demo Accounts Section */}
          <View style={styles.demoSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Demo Accounts</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.demoAccounts}>
              <View style={styles.demoAccountItem}>
                <Text style={styles.demoLabel}>Email:</Text>
                <Text style={styles.demoValue}>demo@example.com</Text>
              </View>
              <View style={styles.demoAccountItem}>
                <Text style={styles.demoLabel}>Password:</Text>
                <Text style={styles.demoValue}>demo123</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { marginTop: 12 }]}
              onPress={handleUseDemoAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Use Demo Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

