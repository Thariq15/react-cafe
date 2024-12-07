import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const defaultImage = require('../assets/default.png');

const CartScreen = () => {
  const navigation = useNavigation();

  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login Required', 'You need to log in to view the cart.');
      return;
    }

    const uid = user.uid;
    const unsubscribe = onSnapshot(collection(db, 'cart', uid, 'items'), (snapshot) => {
      setCartItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // Pure function: Mengupdate kuantitas tanpa mutasi
  const updateQuantity = (items, id, delta) => {
    return items
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      )
      .filter((item) => item.quantity > 0);
  };

  const handleQuantityChange = async (id, delta) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user.uid;

    const updatedItems = updateQuantity(cartItems, id, delta);
    const targetItem = updatedItems.find((item) => item.id === id);

    try {
      if (targetItem) {
        await updateDoc(doc(db, 'cart', uid, 'items', id), { quantity: targetItem.quantity });
      } else {
        await deleteDoc(doc(db, 'cart', uid, 'items', id));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Pure function: Menghitung total dan diskon
  const calculateTotals = (items, discount) => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const discountedTotal = subtotal - (subtotal * discount) / 100;
    const deliveryFee = 3.5;
    const total = discountedTotal + deliveryFee;
    return { subtotal, discountedTotal, deliveryFee, total };
  };

  const { subtotal, discountedTotal, deliveryFee, total } = calculateTotals(cartItems, discount);

  // Pure function: Menerapkan promo code
  const applyPromoCode = (code) => {
    return code === 'DISCOUNT10' ? 10 : 0;
  };

  const handleApplyPromo = () => {
    const appliedDiscount = applyPromoCode(promoCode);
    setDiscount(appliedDiscount);

    if (appliedDiscount) {
      Alert.alert('Promo Applied', `${appliedDiscount}% discount applied.`);
    } else {
      Alert.alert('Invalid Code', 'The promo code is not valid.');
    }
  };

  const handleCheckout = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login Required', 'You need to log in to perform this action.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    const uid = user.uid;

    const transactionData = {
      uid,
      items: cartItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      date: new Date().toISOString(),
      status: 'Pending',
    };

    try {
      await addDoc(collection(db, 'transactions'), transactionData);

      // Menghapus item dari cart
      await Promise.all(cartItems.map((item) => deleteDoc(doc(db, 'cart', uid, 'items', item.id))));
      setCartItems([]);
      Alert.alert('Success', 'Transaction completed!');
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'Failed to complete the transaction. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image || defaultImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Cart</Text>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
      />
      <View style={styles.promoContainer}>
        <TextInput
          style={styles.promoInput}
          placeholder="Promo Code"
          value={promoCode}
          onChangeText={setPromoCode}
        />
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.summaryValue}>-${(subtotal * discount / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>CHECK OUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF7E6',
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  itemPrice: {
    fontSize: 14,
    color: '#8B5E3C',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  quantityButtonText: {
    color: '#FFF7E6',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#5C4033',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F5DEB3',
    padding: 10,
    borderRadius: 25,
    marginRight: 8,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#8B4513',
    padding: 10,
    borderRadius: 25,
  },
  applyButtonText: {
    color: '#FFF7E6',
    fontWeight: 'bold',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#FFF7E6',
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#8B5E3C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  checkoutButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF7E6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFF',
  },
});

export default CartScreen;
