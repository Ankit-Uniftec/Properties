import { app } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
export default function MenuScreen({ onLogout }: { onLogout: () => void }) {
  const handleLogout = async () => {
      const auth = getAuth(app);
      await signOut(auth);
      onLogout();
    };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is Menu Screen</Text>
      <Button title="Logout" onPress={handleLogout} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { fontSize: 24, fontWeight: "bold" },
});
