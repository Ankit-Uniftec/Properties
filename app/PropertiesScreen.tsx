import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase";

type Property = {
  id: string;
  thumbnailURL: string;
  title: string;
  location: string;
  rate: string;
  type: string;
  description: string;
  otherPhotoURLs: string[]; // or string if you saved single URL
};

export default function PropertiesScreen() {
  const [selectedTab, setSelectedTab] = useState<"your" | "shared">("your");
  const [yourProperties, setYourProperties] = useState<Property[]>([]);
  const [sharedProperties, setSharedProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch your properties
      const q1 = query(
        collection(db, "properties"),
        where("status", "==", "approved"),
        where("ownerId", "==", user.uid)
      );
      const yourSnap = await getDocs(q1);
      const yourProps: any[] = [];
      yourSnap.forEach((doc) => yourProps.push({ id: doc.id, ...doc.data() }));
      setYourProperties(yourProps);

      // Fetch shared properties
      const q2 = query(
        collection(db, "properties"),
        where("status", "==", "approved"),
        where("sharedWith", "array-contains", user.uid)
      );
      const sharedSnap = await getDocs(q2);
      const sharedProps: any[] = [];
      sharedSnap.forEach((doc) => sharedProps.push({ id: doc.id, ...doc.data() }));
      setSharedProperties(sharedProps);
    };

    fetchProperties();
  }, []);

  const dataToShow = selectedTab === "your" ? yourProperties : sharedProperties;

  const renderPropertyCard = (item: Property) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/PropertyDetailScreen",
          params: { property: JSON.stringify(item) },
        })
      }
    >
      {/* Thumbnail */}
      {item.thumbnailURL ? (
        <Image source={{ uri: item.thumbnailURL }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="image-outline" size={32} color="#aaa" />
        </View>
      )}

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#007AFF" />
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.tagRow}>
          {item.rate && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.rate}</Text>
            </View>
          )}
          {item.type && (
            <View style={[styles.tag, { backgroundColor: "#EAF4FF" }]}>
              <Text style={[styles.tagText, { color: "#007AFF" }]}>
                {item.type}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Properties</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "your" && styles.activeTab]}
          onPress={() => setSelectedTab("your")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "your" && styles.activeTabText,
            ]}
          >
            Your Properties
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "shared" && styles.activeTab]}
          onPress={() => setSelectedTab("shared")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "shared" && styles.activeTabText,
            ]}
          >
            Shared with me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        {selectedTab === "your"
          ? "Your Registered Properties"
          : "Properties Shared with You"}
      </Text>

      {/* List */}
      {dataToShow.length === 0 ? (
        <View style={styles.container}>
          <Text>No properties available.</Text>
        </View>
      ) : (
        <FlatList
          data={dataToShow}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderPropertyCard(item)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    marginTop: 25,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    backgroundColor: "#7e7c7c25",
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "black",
    marginLeft: 30,
  },

  tabContainer: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "black",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#3572EF",
  },
  tabText: {
    fontSize: 15,
    color: "white",
    fontWeight: "400",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "400",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginVertical: 8,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  location: { fontSize: 13, color: "#555", marginLeft: 4 },
  tagRow: { flexDirection: "row", marginTop: 6 },
  tag: {
    backgroundColor: "#FFF4E5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: { fontSize: 12, fontWeight: "600", color: "#FF8A00" },
});
