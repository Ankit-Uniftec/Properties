import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase";

export default function TowerSelectionScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams();
  const [towers, setTowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTowers, setFilteredTowers] = useState([]);

  useEffect(() => {
    const fetchTowers = async () => {
      if (!propertyId) return;
      try {
        const docRef = doc(db, "properties", propertyId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const towerList = data.towers || [];
          setTowers(towerList);
          setFilteredTowers(towerList); // ✅ show all by default
        }
      } catch (err) {
        console.error("Error fetching towers:", err);
      }
    };
    fetchTowers();
  }, [propertyId]);

  // 🔍 Filter towers when search changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTowers(towers); // show all if empty
    } else {
      const results = towers.filter((tower) =>
        tower.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTowers(results);
    }
  }, [searchQuery, towers]);

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Search input */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#888"
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by tower name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.title}>Select Tower/Building</Text>
      <FlatList
        numColumns={3}
        data={filteredTowers}
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
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: {
    paddingTop: 16,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  backBtn: {
    backgroundColor: "#7e7c7c25",
    padding: 6,
    borderRadius: 20,
  },
  searchInput: { flex: 1, paddingVertical: 8 },
  title: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#007AFF",
  },
  box: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    margin: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: { fontSize: 16, fontWeight: "600", color: "#1D1D1D" },
});
