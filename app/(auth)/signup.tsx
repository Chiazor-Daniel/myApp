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

export default function AuthScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        // When keyboard is visible, move image DOWN below the Log In
        // When just using gesture, move image UP to fill empty space
        toValue: expand ? (isKeyboard ? 300 : -150) : 0,
        duration: 300,
        useNativeDriver: false
      })
    ]).start();
  };

  const handleSignUp = () => {
    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password must contain a capital letter, a number, and be minimum of 6 characters');
      return;
    }
    
    // Navigate to welcome screen after successful signup
    router.replace('/welcome');
  };

  return (
    <LinearBg>
      <View style={styles.container}>
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
            source={require('../../assets/signup.png')} 
            style={[
              styles.signupImage,
              {
                transform: [
                  { translateX: -100 }, 
                  { translateY: Animated.add(180, imageTranslateY) }, 
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
            <Text style={styles.formTitle}>Create an Account</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder=""
              />
            </View>
            
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
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Re-enter Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder=""
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.passwordRequirements}>
              Password must contain a <Text style={styles.bold}>capital letter</Text>, a <Text style={styles.bold}>number</Text>, and be minimum of <Text style={styles.bold}>6 characters</Text>.
            </Text>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <View style={styles.robotAssistant} />
        </ScrollView>
      </View>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    padding: 20,
    paddingTop: 80,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
  },
  boldTitle: {
    fontSize: 24,
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
  passwordRequirements: {
    fontSize: 12,
    color: '#666',
    marginBottom: 25,
  },
  bold: {
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  robotAssistant: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  signupImage: {
    position: 'absolute',
    objectFit: 'cover',
    top: '0%',
    left: '50%',
  },
});