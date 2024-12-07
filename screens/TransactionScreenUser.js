import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const auth = getAuth();
  const navigation = useNavigation();

  // Fungsi untuk mendapatkan transaksi pengguna
  const fetchTransactions = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert('You need to log in to view transactions.');
      return [];
    }

    try {
      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', user.uid) // Hanya transaksi pengguna saat ini
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Failed to load transactions.');
      return [];
    }
  };

  // Memuat transaksi saat komponen pertama kali dirender
  useEffect(() => {
    fetchTransactions().then(setTransactions);
  }, [auth]);

  // Fungsi untuk merender item secara deklaratif
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>Transaction ID: {item.id}</Text>
      <Text style={styles.itemDetail}>Total: ${item.total.toFixed(2)}</Text>
      <Text style={styles.itemDetail}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.itemDetail}>Items:</Text>
      {renderItems(item.items)}
    </View>
  );

  // Higher-order function untuk merender daftar item
  const renderItems = (items) =>
    items.map((cartItem, index) => (
      <Text key={index} style={styles.itemSubDetail}>
        - {cartItem.name} x {cartItem.quantity}
      </Text>
    ));

  // Komponen utama
  return (
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>My Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#FFF7E6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#8B5E3C',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginVertical: 16,
  },
  itemContainer: {
    backgroundColor: '#FFF7E6',
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 8,
  },
  itemDetail: {
    fontSize: 14,
    color: '#8B5E3C',
    marginBottom: 4,
  },
  itemSubDetail: {
    fontSize: 12,
    color: '#5C4033',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TransactionScreen;
