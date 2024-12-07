import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';

const App = () => {
  const navigation = useNavigation();
  const [state, setState] = useState({
    coffees: [],
    searchText: '',
  });

  // Immutability : Mengelola perubahan state
  const updateState = (updates) =>
    setState((prevState) => ({ ...prevState, ...updates }));

  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Login');
  };

  // Pure Function: Mengambi data dari firestore
  const fetchCoffees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coffeeMenu'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      updateState({ coffees: data });
    } catch (error) {
      console.error('Error fetching data:', error.message);
      Alert.alert('Error', 'Failed to load coffee menu.');
    }
  };

  // Pure Function : Filter kopi bedasarkan pencarian 
  const getFilteredCoffees = () => {
    const { coffees, searchText } = state;
    return searchText.trim() === ''
      ? coffees
      : coffees.filter((coffee) =>
          coffee.name.toLowerCase().includes(searchText.toLowerCase())
        );
  };

  useEffect(() => {
    fetchCoffees();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Coffee Shop</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        {['Cart', 'TransactionUser'].map((screen) => (
          <TouchableOpacity
            key={screen}
            onPress={() => navigation.navigate(screen)}
            style={styles.addButton}
          >
            <Text style={styles.addText}>{screen}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KOMPONEN PENCARIAN */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coffee..."
          placeholderTextColor="#FFFFFF"
          value={state.searchText}
          onChangeText={(text) => updateState({ searchText: text })}
        />
      </View>

      {/* DAFTAR KOPI */}
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coffee</Text>
          <View style={styles.cardContainer}>
            {getFilteredCoffees().map((coffee) => (
              <CoffeeCard key={coffee.id} coffee={coffee} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const CoffeeCard = ({ coffee }) => {
  const navigation = useNavigation();

  const goToDetails = () => navigation.navigate('Coffee', { coffeeId: coffee.id });

  return (
    <View style={styles.card}>
      <Image source={{ uri: coffee.image }} style={styles.cardImage} />
      <TouchableOpacity onPress={goToDetails}>
        <Text style={styles.cardTitle}>{coffee.name}</Text>
      </TouchableOpacity>
      <Text style={styles.cardDescription}>{coffee.description}</Text>
      <Text style={styles.cardPrice}>${coffee.price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Gaya CSS tidak berubah
  logoutButton: { backgroundColor: '#D1A97B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  addButton: { backgroundColor: '#D1A97B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  addText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { padding: 16, backgroundColor: '#8B5E3C' },
  searchInput: { backgroundColor: '#D1A97B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, color: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#8B5E3C', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#8B5E3C', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, color: '#FFFFFF', marginBottom: 16 },
  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#D1A97B', borderRadius: 12, padding: 16, position: 'relative', marginBottom: 16 },
  cardImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 4 },
  cardDescription: { fontSize: 12, color: '#FFFFFF', marginBottom: 8 },
  cardPrice: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
});

export default App;
