import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';

const CustomHeader = ({ scene, navigation, previous }) => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const { options } = scene.descriptor;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Appbar.Header style={[styles.header, { backgroundColor: colors.primary }]}>
      {previous ? (
        <Appbar.BackAction
          onPress={navigation.goBack}
          color="white"
        />
      ) : (
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.openDrawer()}
          color="white"
        />
      )}
      
      <Appbar.Content
        title={options.title || 'E Mart'}
        titleStyle={styles.title}
        color="white"
      />
      
      <Appbar.Action
        icon="bell"
        onPress={() => navigation.navigate('Notifications')}
        color="white"
      />
      
      <Appbar.Action
        icon="account"
        onPress={() => navigation.navigate('Profile')}
        color="white"
      />
      
      <Appbar.Action
        icon="logout"
        onPress={handleLogout}
        color="white"
      />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomHeader; 