import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LOCAL_IP, API_BASE_URL } from '../services/config';

const ConnectionError = ({ onRetry, errorDetails }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="server-network-off" size={80} color="#d32f2f" />
      
      <Text style={styles.title}>Connection Failed</Text>
      
      <Text style={styles.subtitle}>
        The app cannot reach the backend server.
      </Text>

      <View style={styles.debugBox}>
        <Text style={styles.debugText}>Trying to connect to:</Text>
        <Text style={styles.ipText}>{API_BASE_URL}</Text>
        <Text style={styles.debugText}>Current Detected IP: {LOCAL_IP}</Text>
      </View>

      <Text style={styles.instruction}>
        1. Ensure your backend is running (`node demo_server.js`)
        2. Ensure XAMPP (MySQL) is running!
        3. Ensure phone/PC are on the same Wi-Fi.
        4. If using a physical phone, update 'HARDCODED_IP' in services/config.js.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  debugBox: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 20 },
  debugText: { color: '#555', fontSize: 12 },
  ipText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginVertical: 5 },
  instruction: { fontSize: 14, color: '#444', textAlign: 'left', width: '100%', marginBottom: 30, lineHeight: 22 },
  button: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ConnectionError;