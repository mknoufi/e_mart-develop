import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';
import { LoadingContext } from '../../contexts/LoadingContext';
import { apiService } from '../../services/apiService';
import { theme } from '../../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { colors, spacing, borderRadius } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      showLoading('Logging in...');
      
      const response = await apiService.login(email, password);
      
      if (response.success) {
        await login(response.token, response.user, rememberMe);
        // Navigation will be handled by AuthContext
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const handleBiometricLogin = async () => {
    try {
      showLoading('Authenticating...');
      // Implement biometric authentication
      Alert.alert('Biometric Login', 'Biometric authentication feature coming soon!');
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      hideLoading();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="shopping" size={80} color="white" />
            <Title style={styles.appTitle}>E Mart</Title>
            <Paragraph style={styles.appSubtitle}>
              Electronics Store Management
            </Paragraph>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Card style={styles.loginCard}>
            <Card.Content>
              <Title style={styles.loginTitle}>Welcome Back</Title>
              <Paragraph style={styles.loginSubtitle}>
                Sign in to your account
              </Paragraph>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                />

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}>
                    <Icon
                      name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}>
                  Sign In
                </Button>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                <Button
                  mode="outlined"
                  onPress={handleBiometricLogin}
                  style={styles.biometricButton}
                  icon="fingerprint">
                  Sign in with Biometric
                </Button>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  appSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -50,
  },
  loginCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 4,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  biometricButton: {
    borderRadius: 12,
    borderColor: theme.colors.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: theme.colors.textSecondary,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen; 