import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import { doc, getDoc, collection, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const CoffeeScreen = ({ route }) => {
  const { coffeeId } = route.params;
  const [coffee, setCoffee] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation();

  // Fungsi untuk mendapatkan detail kopi dari Firestore
  const fetchCoffee = async (id) => {
    try {
      const coffeeRef = doc(db, 'coffeeMenu', id);
      const coffeeSnap = await getDoc(coffeeRef);
      return coffeeSnap.exists() ? coffeeSnap.data() : null;
    } catch (error) {
      console.error('Error fetching coffee details:', error);
      return null;
    }
  };

  // Mengambil detail kopi saat komponen dirender
  useEffect(() => {
    fetchCoffee(coffeeId).then(setCoffee);
  }, [coffeeId]);

  // Fungsi untuk menambah ke cart
  const addToCart = async (userId, coffeeData, qty) => {
    try {
      const cartItemRef = doc(db, 'cart', userId, 'items', coffeeId);
      const cartSnap = await getDoc(cartItemRef);

      const cartData = cartSnap.exists()
        ? { quantity: increment(qty) } // Update jika sudah ada
        : { id: coffeeId, ...coffeeData, quantity: qty }; // Tambahkan baru

      const method = cartSnap.exists() ? updateDoc : setDoc;
      await method(cartItemRef, cartData);

      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Fungsi pembungkus untuk menangani penambahan item ke cart
  const handleAddToCart = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('You need to log in to add items to the cart.');
      return;
    }

    addToCart(user.uid, coffee, quantity);
  };

  // Pure function untuk mengubah kuantitas
  const updateQuantity = (currentQuantity, delta) => Math.max(1, currentQuantity + delta);

  // Fungsi pembungkus untuk mengubah kuantitas
  const handleQuantityChange = (delta) => setQuantity((qty) => updateQuantity(qty, delta));

  if (!coffee) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Coffee Image */}
      <Image source={{ uri: coffee.image }} style={styles.image} />

      {/* Coffee Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.coffeeTitle}>{coffee.name}</Text>
        <Text style={styles.description}>{coffee.description}</Text>
        <Text style={styles.volumeText}>
          Volume: <Text style={styles.volumeValue}>{coffee.volume || 'N/A'}</Text>
        </Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleQuantityChange(-1)} style={styles.quantityButton}>
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(1)} style={styles.quantityButton}>
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.priceText}>${(coffee.price * quantity).toFixed(2)}</Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.orderButton} onPress={handleAddToCart}>
        <Text style={styles.orderButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5E3C',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#D1A97B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coffeeTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    backgroundColor: '#D1A97B',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  volumeText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 32,
  },
  volumeValue: {
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#D1A97B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  orderButtonText: {
    color: '#8B5E3C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CoffeeScreen;
