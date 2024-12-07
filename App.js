import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import EnterScreen from "./screens/EnterScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen"; // Admin
import HomeScreenUser from "./screens/HomeScreenUser"; // user
import CofeeScreen from "./screens/CofeeScreen";
import CartScreen from "./screens/CartScreen";
import TransactionScreen from "./screens/TransactionScreen"; // Admin
import TransactionScreenUser from "./screens/TransactionScreenUser"; // User
import AddScreen from "./screens/AddMenuScreen";
import useAuth from "./hooks/useAuth";

const Stack = createStackNavigator();

export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    // Tampilkan indikator loading selama proses autentikasi
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Rute untuk pengguna yang belum login
          <>
            <Stack.Screen name="Enter" component={EnterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : role === "admin" ? (
          // Rute untuk admin
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Coffee" component={CofeeScreen} />
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Transaction" component={TransactionScreen} />
          </>
        ) : (
          // Rute untuk user
          <>
            <Stack.Screen name="HomeUser" component={HomeScreenUser} />
            <Stack.Screen name="Coffee" component={CofeeScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="TransactionUser" component={TransactionScreenUser} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
