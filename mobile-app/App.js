import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { LoadingProvider } from './src/contexts/LoadingContext';

// Import Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import SeriesManagementScreen from './src/screens/series/SeriesManagementScreen';
import PurchaseInvoiceScreen from './src/screens/purchase/PurchaseInvoiceScreen';
import PurchaseOrderScreen from './src/screens/purchase/PurchaseOrderScreen';
import SalesInvoiceScreen from './src/screens/sales/SalesInvoiceScreen';
import InventoryScreen from './src/screens/inventory/InventoryScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import NotificationScreen from './src/screens/notifications/NotificationScreen';
import ScanQRScreen from './src/screens/scan/ScanQRScreen';
import CameraScreen from './src/screens/camera/CameraScreen';

// Import Components
import LoadingOverlay from './src/components/common/LoadingOverlay';
import NetworkStatusBar from './src/components/common/NetworkStatusBar';
import CustomHeader from './src/components/common/CustomHeader';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);

  useEffect(() => {
    initializeApp();
    setupNetworkListener();
    hideSplashScreen();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for stored authentication token
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNetworkListener = () => {
    NetInfo.addEventListener(state => {
      setIsNetworkConnected(state.isConnected);
      
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const hideSplashScreen = () => {
    if (Platform.OS === 'android') {
      SplashScreen.hide();
    }
  };

  const AuthStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );

  const MainStack = () => (
    <Stack.Navigator
      screenOptions={{
        header: props => <CustomHeader {...props} />,
        gestureEnabled: true,
      }}>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'E Mart Dashboard' }}
      />
      <Stack.Screen 
        name="SeriesManagement" 
        component={SeriesManagementScreen}
        options={{ title: 'Series Management' }}
      />
      <Stack.Screen 
        name="PurchaseInvoice" 
        component={PurchaseInvoiceScreen}
        options={{ title: 'Purchase Invoice' }}
      />
      <Stack.Screen 
        name="PurchaseOrder" 
        component={PurchaseOrderScreen}
        options={{ title: 'Purchase Order' }}
      />
      <Stack.Screen 
        name="SalesInvoice" 
        component={SalesInvoiceScreen}
        options={{ title: 'Sales Invoice' }}
      />
      <Stack.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="ScanQR" 
        component={ScanQRScreen}
        options={{ title: 'Scan QR Code' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Camera' }}
      />
    </Stack.Navigator>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading E Mart...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NetworkProvider>
        <AuthProvider>
          <LoadingProvider>
            <SafeAreaView style={styles.container}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.primary}
              />
              <NetworkStatusBar isConnected={isNetworkConnected} />
              <NavigationContainer>
                {isAuthenticated ? <MainStack /> : <AuthStack />}
              </NavigationContainer>
              <LoadingOverlay />
              <FlashMessage position="top" />
            </SafeAreaView>
          </LoadingProvider>
        </AuthProvider>
      </NetworkProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App; 