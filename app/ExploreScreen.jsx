import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase";

export default function ExploreScreen() {
  const [properties, setProperties] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [likesMap, setLikesMap] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const qSnap = await getDocs(collection(db, "properties"));
        const docs = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // ✅ filter out properties that have "status"
        const filteredDocs = docs.filter((p) => !("status" in p));
        setProperties(filteredDocs);
      } catch (err) {
        console.error("Fetch properties error:", err);
      }
    };
    fetchProperties();
  }, []);

  const toggleLike = (id) => {
    setLikesMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const CategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsContainer}
    >
      {["All", "Buy", "Sale", "Rent"].map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.chip,
            selectedType.toLowerCase() === t.toLowerCase() && styles.chipActive,
          ]}
          onPress={() => setSelectedType(t)}
        >
          <Text
            style={[
              styles.chipText,
              selectedType.toLowerCase() === t.toLowerCase() &&
                styles.chipTextActive,
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeaturedCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.featureCard}
      onPress={() =>
        router.push({
          pathname: "/PropertyDetailScreen",
          params: { id: item.id },
        })
      }
    >
      <Image source={{ uri: item.thumbnailURL }} style={styles.featureImage} />
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.featureHeart}
        onPress={() => toggleLike(item.id)}
      >
        <Ionicons
          name={likesMap[item.id] ? "heart" : "heart-outline"}
          size={18}
          color={likesMap[item.id] ? "#FF4D6D" : "#666"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }) => (
  <TouchableOpacity
    style={styles.trendingCard}
    onPress={() =>
      router.push({
        pathname: "/PropertyDetailScreen",
        params: { id: item.id },
      })
    }
  >
    <Image source={{ uri: item.thumbnailURL }} style={styles.trendingImage} />
    <View style={styles.trendingInfo}>
      <Text style={styles.trendingCategory}>
        {item.category || "Apartment"}
      </Text>
      <Text style={styles.trendingTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.trendingLocation}>{item.location}</Text>
    </View>
    <TouchableOpacity
      style={styles.trendingHeart}
      onPress={() => toggleLike(item.id)}
    >
      <Ionicons
        name={likesMap[item.id] ? "heart" : "heart-outline"}
        size={20}
        color={likesMap[item.id] ? "#FF4D6D" : "#E76E9A"}
      />
    </TouchableOpacity>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      {/* 🔹 Fixed top section */}
      <View style={styles.staticSection}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/MainScreen")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore</Text>
        </View>

        {/* Category chips */}
        <CategoryChips />

        {/* Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featureScroll}
        >
          {properties.slice(0, 10).map((p) => renderFeaturedCard(p))}
        </ScrollView>

        {/* Trending Near You header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Near You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Scrollable list */}
      <FlatList
        data={properties.slice(0, 20)}
        renderItem={renderTrendingItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1 }}
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
  backBtn: {
    backgroundColor: "#7e7c7c25",
    padding: 6,
    borderRadius: 20,
  },

  featureScroll: { marginTop: 8 },
  featureCard: {
    width: 300,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    padding: 8,
    position: "relative",
  },
  featureImage: { width: "100%", height: 150, borderRadius: 10 },
  featureInfo: { paddingTop: 8 },
  featureTitle: { fontSize: 14, fontWeight: "600" },
  featureHeart: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 2,
  },

  chipsContainer: { marginTop: 16, marginBottom: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F0F3F6",
    marginRight: 10,
  },
  chipActive: { backgroundColor: "#007AFF" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  seeAll: { fontSize: 13, color: "#007AFF" },

  trendingCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
  },
  trendingImage: { width: 92, height: 70, borderRadius: 8, marginRight: 12 },
  trendingInfo: { flex: 1 },
  trendingCategory: { color: "#22C55E", fontSize: 12, marginBottom: 2 },
  trendingTitle: { fontSize: 14, fontWeight: "600" },
  trendingLocation: { fontSize: 12, color: "#888", marginTop: 2 },
  trendingStatus: { marginTop: 8, color: "#007AFF", fontWeight: "600" },
  trendingHeart: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 1,
    marginLeft: 8,
  },
});
