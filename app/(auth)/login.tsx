import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  Dimensions,
  PanResponder
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import LinearBg from '../components/LinearBg';

const windowHeight = Dimensions.get('window').height;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animated values
  const formHeight = useRef(new Animated.Value(400)).current;
  const topSectionOpacity = useRef(new Animated.Value(1)).current;
  const imageTranslateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical movements with some threshold
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // If dragging up and not at max height or dragging down and not at min height
        if ((gestureState.dy < 0 && formHeight._value < 600) || 
            (gestureState.dy > 0 && formHeight._value > 400)) {
          // Calculate new form height based on drag
          const newHeight = Math.max(400, Math.min(600, formHeight._value - gestureState.dy));
          formHeight.setValue(newHeight);
          
          // Adjust opacity and translation proportionally
          const progress = (newHeight - 400) / 200; // 0 to 1 based on form height
          topSectionOpacity.setValue(1 - progress);
          
          // Move image UP into the empty space when using gesture
          if (!keyboardVisible) {
            imageTranslateY.setValue(-150 * progress); // Move up into empty space
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // When released, snap to either expanded or collapsed state
        const expand = gestureState.dy < 0; // Expand if dragged up
        animateFormState(expand);
      },
    })
  ).current;

  // Effect for keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        animateFormState(true, true); // Pass true for keyboard
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        animateFormState(false); // Return to default state
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Animation function for transitioning between states
  const animateFormState = (expand, isKeyboard = false) => {
    Animated.parallel([
      Animated.timing(formHeight, {
        toValue: expand ? 600 : 400,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(topSectionOpacity, {
        toValue: expand ? 0 : 1,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(imageTranslateY, {
        // When keyboard is visible, move image DOWN below the Register Now
        // When just using gesture, move image UP to fill empty space
        toValue: expand ? (isKeyboard ? 300 : -150) : 0,
        duration: 300,
        useNativeDriver: false
      })
    ]).start();
  };

  const handleLogin = () => {
    router.replace('/welcome');
  };

  return (
    <LinearBg>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar style="light" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={!keyboardVisible}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <Animated.View style={[
            styles.topSection,
            { opacity: topSectionOpacity }
          ]}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Unlock Your Potential With</Text>
              <Text style={styles.boldTitle}>Our Interactive Textbook.</Text>

              <Text style={styles.subtitle}>
                Discover a smarter way to learn with interactive textbooks for a 21st-century education.
              </Text>
            </View>
          </Animated.View>

          <Animated.Image
            source={require('../../assets/login.png')}
            style={[
              styles.loginImage,
              { 
                transform: [
                  { translateX: -100 },
                  { translateY: Animated.add(-80, imageTranslateY) },
                  { scale: 0.9 }
                ],
                zIndex: keyboardVisible ? 0 : 99 // Lower zIndex when keyboard is visible
              }
            ]}
          />

          <Animated.View 
            style={[
              styles.formSection,
              { height: formHeight }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.formHandle} />
            <Text style={styles.formTitle}>Login to Begin</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Register now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    padding: 20,
    paddingTop: 60,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    lineHeight: 22,
  },
  boldTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  formSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  formHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  loginImage: {
    position: 'absolute',
    objectFit: 'cover',
    top: '30%',
    left: '50%',
  },
});