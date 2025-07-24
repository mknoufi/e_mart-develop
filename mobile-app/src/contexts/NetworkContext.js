import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-netinfo/netinfo';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      
      // Determine connection quality
      if (state.type === 'wifi') {
        setConnectionQuality('excellent');
      } else if (state.type === 'cellular') {
        if (state.details && state.details.cellularGeneration) {
          if (state.details.cellularGeneration === '5g') {
            setConnectionQuality('excellent');
          } else if (state.details.cellularGeneration === '4g') {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } else {
          setConnectionQuality('good');
        }
      } else {
        setConnectionQuality('unknown');
      }
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        details: state.details,
      };
    } catch (error) {
      console.error('Error checking connection:', error);
      return {
        isConnected: false,
        type: 'unknown',
        details: null,
      };
    }
  };

  const waitForConnection = async (timeout = 30000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          clearTimeout(timer);
          unsubscribe();
          resolve(state);
        }
      });
    });
  };

  const value = {
    isConnected,
    connectionType,
    connectionQuality,
    checkConnection,
    waitForConnection,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}; 