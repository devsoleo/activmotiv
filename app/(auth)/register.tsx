import * as React from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter()

  const handleSignupRedirect = () => router.replace('/(auth)/login')

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

      </View>

      <TouchableOpacity onPress={handleSignupRedirect}>
        <Text style={styles.signupText}>Pas encore inscrit ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  container: {
    justifyContent: 'center',
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  signupText: {
    textAlign: 'center',
    color: '#1e90ff',
    marginBottom: 24,
  },
});
