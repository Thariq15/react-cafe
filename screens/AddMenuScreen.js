import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../config/firebase';
import { collection, addDoc } from "firebase/firestore";

// Menggunakan useState untuk membuat state yang immutable 
export default function AddCoffeeMenu({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [volume, setVolume] = useState('');
  const [image, setImage] = useState(null);

  // Fungsi untuk memilih gambar dari galeri
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Fungsi untuk menambahkan data ke Firestore
  const handleAddCoffee = async () => {
    if (!name || !price || !description || !volume || !image) {
      Alert.alert("Error", "Please fill in all fields and upload an image.");
      return;
    }

    try {
      await addDoc(collection(db, "coffeeMenu"), {
        name: name,
        price: parseFloat(price),
        description: description,
        volume: volume,
        image: image,
      });

      Alert.alert("Success", `Added ${name} to the menu!`);

      // Reset fields setelah di tambahkan 
      setImage(null);
      setName('');
      setPrice('');
      setDescription('');
      setVolume('');

    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Failed to add coffee menu. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header dengan tombol kembali */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Add New Coffee</Text>
      {/* Image Picker */}
      <Text style={styles.label}>Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Pick an image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      {/* Name Input */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter coffee name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      {/* Price Input */}
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter coffee price"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      {/* Description Input */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter coffee description"
        placeholderTextColor="#888"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Volume Input */}
      <Text style={styles.label}>Volume</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter coffee volume (e.g., 12oz)"
        placeholderTextColor="#888"
        value={volume}
        onChangeText={setVolume}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCoffee}>
        <Text style={styles.addButtonText}>Add Coffee</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#D1A97B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#8B5E3C',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#D1A97B',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#D1A97B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#D1A97B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#8B5E3C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
