import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase";

export default function TowerSelectionScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams();
  const [towers, setTowers] = useState([]);

  useEffect(() => {
    const fetchTowers = async () => {
      if (!propertyId) return;
      try {
        const docRef = doc(db, "properties", propertyId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTowers(data.towers || []);
        }
      } catch (err) {
        console.error("Error fetching towers:", err);
      }
    };
    fetchTowers();
  }, [propertyId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Tower/Building</Text>
      <FlatList
        numColumns={3}
        data={towers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.box}
            onPress={() =>
              router.push({
                pathname: "/FloorSelectionScreen",
                params: { propertyId, towerIndex: index, towerName: item.name },
              })
            }
          >
            <Text style={styles.boxText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 20, color: "#007AFF" },
  box: {
    flex: 1,
    backgroundColor: "#EAF4FF",
    margin: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
});
