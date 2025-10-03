import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase";

export default function SeeAllScreen() {
  const { category } = useLocalSearchParams(); 
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState(""); // ✅ search state
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // filter by category
      const filtered =
        category === "All"
          ? data
          : data.filter(
              (p) =>
                p.category?.toLowerCase() ===
                category?.toString().toLowerCase()
            );

      setProperties(filtered);
    };

    fetchProperties();
  }, [category]);

  // ✅ Search filter (title OR location)
  const filteredProperties = properties.filter((item) => {
    if (!searchText) return true; // show all if no search
    const text = searchText.toLowerCase();
    return (
      item.title?.toLowerCase().includes(text) ||
      item.location?.address?.toLowerCase().includes(text)
    );
  });

  const renderCard = (item) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/PropertyDetailScreen",
          params: { id: item.id },
        })
      }
    >
      {item.thumbnailURL && (
        <Image source={{ uri: item.thumbnailURL }} style={styles.cardImage} />
      )}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardLocation}>
        <Ionicons name="location-outline" size={12} color="gray" />{" "}
        {item.location?.address || "N/A"}, {item.location?.city}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{category} Properties</Text>
            </View>
      

      {/* ---- Search Bar ---- */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#888"
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or location"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* ---- Grid of Properties ---- */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        numColumns={2} // ✅ 2 per row
        renderItem={({ item }) => renderCard(item)}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
            No properties found
          </Text>
        }
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
headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "black",
    marginLeft: 30,
  },
  // ✅ Search Bar (same UI as MainScreen)
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

  // ✅ Card
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 8,
  },
  cardImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: "500" },

  cardLocation: { fontSize: 12, color: "gray", marginTop: 2 },
});
