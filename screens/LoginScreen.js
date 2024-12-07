import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Functional helper untuk validasi input (Pure Function: Tidak memiliki efek samping)
const validateInput = (email, password) => {
  if (!email || !password) return 'Please fill all fields.'; // Hasil hanya bergantung pada input
  return null; // Tidak ada efek samping, hanya mengembalikan hasil
};

// Functional helper untuk autentikasi (Pure Function: Menggunakan Promise)
const authenticateUser = async (auth, email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user }; // Hasil murni berdasarkan input dan Firebase
  } catch (err) {
    return { success: false, message: 'Invalid email or password.' };
  }
};

// Functional helper untuk mengambil data pengguna (Pure Function: Tidak mengubah state)
const fetchUserData = async (db, userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() }; // Tidak memodifikasi dokumen asli
    } else {
      return { success: false, message: 'User data not found. Please contact support.' };
    }
  } catch (err) {
    return { success: false, message: 'Error fetching user data.' };
  }
};

// Functional helper untuk navigasi berdasarkan role (Pure Function: Hasil tergantung input)
const determineNavigation = (role) => {
  if (role === 'admin') return 'Home'; // Mengembalikan nama layar
  if (role === 'user') return 'HomeUser';
  return null; // Tidak ada efek samping
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); // Immutable state management dengan useState (FP Concept)
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Functional handler untuk submit (Komposisi fungsi untuk memproses data)
  const handleSubmit = async () => {
    // Pure Function: Validasi input tanpa efek samping
    const validationError = validateInput(email, password);
    if (validationError) {
      setError(validationError); // Efek samping yang terisolasi
      return;
    }

    // Pure Function: Otentikasi pengguna tanpa mengubah state
    const authResult = await authenticateUser(auth, email, password);
    if (!authResult.success) {
      setError(authResult.message); // Efek samping yang terisolasi
      return;
    }

    // Pure Function: Mengambil data pengguna tanpa mengubah data di Firestore
    const userDataResult = await fetchUserData(db, authResult.user.uid);
    if (!userDataResult.success) {
      setError(userDataResult.message); // Efek samping yang terisolasi
      return;
    }

    // Pure Function: Menentukan navigasi berdasarkan input role
    const navigationTarget = determineNavigation(userDataResult.data.role);
    if (navigationTarget) {
      navigation.navigate(navigationTarget); // Efek samping untuk navigasi
    } else {
      setError('Role not defined. Please contact support.'); // Efek samping yang terisolasi
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back!</Text>

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
        <View style={styles.row}>
          <TouchableOpacity>
            <Text style={styles.smallText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
          <Text style={styles.buttonTextPrimary}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>New user? Sign Up</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  smallText: {
    fontSize: 12,
    color: '#8B5E3C',
  },
  linkText: {
    fontSize: 12,
    color: '#D2A679',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
