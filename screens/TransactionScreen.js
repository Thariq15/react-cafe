import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AdminTransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const navigation = useNavigation();

  // Fungsi untuk mendapatkan transaksi dari Firestore
  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  // Memuat transaksi saat komponen pertama kali dirender
  useEffect(() => {
    fetchTransactions().then(setTransactions);
  }, []);

  // Fungsi untuk memperbarui status transaksi
  const updateStatus = async (id, newStatus) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, { status: newStatus });

      // Memperbarui state transaksi secara imutabel
      setTransactions((prev) =>
        prev.map((trans) =>
          trans.id === id ? { ...trans, status: newStatus } : trans
        )
      );
      alert('Status updated successfully.');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  // Higher-order function untuk membuat tombol status
  const createStatusButton = (id, status, label) => (
    <TouchableOpacity
      style={styles.statusButton}
      onPress={() => updateStatus(id, status)}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  // Pure function untuk merender item
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>Transaction ID: {item.id}</Text>
      <Text style={styles.itemDetail}>Total: ${item.total.toFixed(2)}</Text>
      <Text style={styles.itemDetail}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.itemDetail}>Status: {item.status}</Text>
      <View style={styles.buttonContainer}>
        {createStatusButton(item.id, 'In Progress', 'In Progress')}
        {createStatusButton(item.id, 'Completed', 'Completed')}
      </View>
    </View>
  );

  // Komponen utama
  return (
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Manage Transactions</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    backgroundColor: '#8B4513',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF7E6',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminTransactionScreen;
