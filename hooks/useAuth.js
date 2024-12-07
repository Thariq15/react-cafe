import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // Tambahkan db jika menggunakan Firestore

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Tambahkan state untuk peran
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid)); // Ambil data pengguna
          if (userDoc.exists()) {
            setRole(userDoc.data().role); // Set role dari Firestore
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Set loading selesai
    });
    return unsub;
  }, []);

  return { user, role, loading };
}
