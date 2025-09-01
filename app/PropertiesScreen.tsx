
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../firebase";

type Property = {
  id: string;
  type: string;
  address: string;
  ownerName: string;
  // add other fields if needed
};

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
  const fetchProperties = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "properties"),
      where("status", "==", "approved"),
      where("ownerId", "==", user.uid)   // 👈 only show my properties
    );

    const querySnapshot = await getDocs(q);
    const props: any[] = [];
    querySnapshot.forEach((doc) => {
      props.push({ id: doc.id, ...doc.data() });
    });
    setProperties(props);
  };

  fetchProperties();
}, []);

  if (!properties.length) {
    return (
      <View style={styles.container}>
        <Text>No approved properties yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.type}</Text>
          <Text>{item.address}</Text>
          <Text>Owner: {item.ownerName}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold" },
});
