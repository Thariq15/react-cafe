import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Pure Function: Validasi input
const validateInput = (email, password) => {
  if (!email || !password) return 'Please fill all fields.';
  return null; // Tidak ada efek samping, hanya menghasilkan validasi
};

// Pure Function: Membuat akun dengan Firebase Authentication
const registerUser = async (auth, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user }; // Hasil tergantung input dan Firebase
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Pure Function: Menyimpan data pengguna ke Firestore
const saveUserData = async (db, userId, email, role) => {
  try {
    await setDoc(doc(db, 'users', userId), { email, role });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Pure Function: Logout dari Firebase Authentication
const logoutUser = async (auth) => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Functional Component
export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState(''); // State immutability dengan React Hooks
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [error, setError] = useState('');

  // Functional handler untuk proses registrasi
  const handleSubmit = async () => {
    const validationError = validateInput(email, password); // Pure Function untuk validasi
    if (validationError) {
      setError(validationError); // Efek samping terbatas pada setError
      return;
    }

    const registerResult = await registerUser(auth, email, password); // Pure Function untuk registrasi
    if (!registerResult.success) {
      setError(registerResult.message); // Efek samping terbatas
      return;
    }

    const saveResult = await saveUserData(db, registerResult.user.uid, email, role); // Pure Function untuk menyimpan data
    if (!saveResult.success) {
      setError(saveResult.message); // Efek samping terbatas
      return;
    }

    const logoutResult = await logoutUser(auth); // Pure Function untuk logout
    if (!logoutResult.success) {
      setError(logoutResult.message); // Efek samping terbatas
      return;
    }

    navigation.navigate('Login'); // Efek samping untuk navigasi
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'user' && styles.roleButtonSelected]}
            onPress={() => setRole('user')}
          >
            <Text style={styles.roleText}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'admin' && styles.roleButtonSelected]}
            onPress={() => setRole('admin')}
          >
            <Text style={styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
          <Text style={styles.buttonTextPrimary}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5E3C',
  },
  card: {
    width: '85%',
    backgroundColor: '#FFF7E6',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#F5DEB3',
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#F5DEB3',
    width: '45%',
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#8B4513',
  },
  roleText: {
    color: '#5C4033',
    fontWeight: 'bold',
  },
  buttonPrimary: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextPrimary: {
    color: '#FFF7E6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: '#8B5E3C',
    fontSize: 14,
    marginTop: 10,
  },
});
