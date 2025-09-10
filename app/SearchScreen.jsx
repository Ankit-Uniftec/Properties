import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
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

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userCity, setUserCity] = useState("");

  const router = useRouter();

  // 🔹 Get user location → fetch city
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync(loc.coords);

      if (address.length > 0) {
        const city = address[0].city || address[0].district || "";
        setUserCity(city);
      }
    })();
  }, []);

  // 🔹 Fetch properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        const qSnap = await getDocs(collection(db, "properties"));
        const docs = qSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => !p.status); // ✅ remove properties with status

        

        setProperties(docs);
        setFiltered(docs); // temporary until filter applies
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Apply filters (search + city)
  useEffect(() => {
    let data = [...properties];

    // search by title or location
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter((p) => {
        const title = String(p.title || "").toLowerCase();
        const location = String(p.location || "").toLowerCase();
        return title.includes(term) || location.includes(term);
      });
    } else if (userCity) {
      // by default, filter by user city
      data = data.filter((p) =>
        String(p.location || "").toLowerCase().includes(userCity.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, properties, userCity]);

  // 🔹 Render card
  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/PropertyDetailScreen",
          params: { id: item.id },
        })
      }
    >
      <Image
        source={{ uri: item.thumbnailURL || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
      />
      <Text style={styles.cardTitle}>{item.title || "Untitled"}</Text>
      <Text style={styles.cardSubtitle}>
        <Ionicons name="location-outline" size={12} color="black" />{" "}
        {item.location || "Unknown location"}
      </Text>
      
    </TouchableOpacity>
  );

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
          placeholder="Search by title or location"
          value={search}
          onChangeText={setSearch}
        />
        
      </View>

      {/* 🔹 Results in 2-column grid */}
      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2} // ✅ 2 cards per row
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
            No properties found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff", paddingHorizontal: 16},
  header: { paddingTop: 16,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",},
  
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
  searchInput: { flex: 1, paddingVertical: 8  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    flex: 0.48, // ✅ 2 cards per row with spacing
    padding: 10,
  },
  cardImage: { width: "100%", height: 120, borderRadius: 10 },
  cardTitle: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  cardSubtitle: { fontSize: 12, color: "#666" },
});
