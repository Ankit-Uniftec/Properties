import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../firebase";

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();   // ✅ now we get only id

  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Description");
  const [isRegistered, setIsRegistered] = useState(false);

  // ✅ Fetch property by ID
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProp({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  // ✅ Check registration
  useEffect(() => {
    if (!prop) return;
    const checkRegistration = async () => {
      try {
        const q = query(
          collection(db, "properties"),
          where("originalPropertyId", "==", prop.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setIsRegistered(true);
        }
      } catch (err) {
        console.error("Error checking registration:", err);
      }
    };
    checkRegistration();
  }, [prop]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!prop) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Property not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ---- Main Image ---- */}
      {prop.thumbnailURL && (
        <Image source={{ uri: prop.thumbnailURL }} style={styles.mainImage} />
      )}

      {/* ---- Overlay: Back ---- */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ---- Info Row ---- */}
      <View style={styles.infoRow}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>4.7 (6.8k)</Text>
        </View>

        <View style={styles.tagRow}>
          {prop.rate && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{prop.rate}</Text>
            </View>
          )}
          {prop.type && (
            <View style={[styles.tag, { backgroundColor: "#EAF4FF" }]}>
              <Text style={[styles.tagText, { color: "#007AFF" }]}>
                {prop.type}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ---- Title + Location ---- */}
      <Text style={styles.title}>{prop.title}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#007AFF" />
        <Text style={styles.location}>{prop.location}</Text>
      </View>

      {/* ---- Buttons Row ---- */}
      <View style={styles.btnRow}>
        {isRegistered ? (
          <View style={[styles.blueBtn, { backgroundColor: "#ccc" }]}>
            <Text style={styles.btnText}>Registered</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.blueBtn}
            onPress={() =>
              router.push({
                pathname: "/RegisterProperty",
                params: { id: prop.id},
                
              })
            }
          >
            <Text style={styles.btnText}>Register this property</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.greenBtn}>
          <Text style={styles.btnText}>Interested in buying?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn}>
          <Ionicons name="heart-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>

      {/* ---- Tabs ---- */}
      <View style={styles.tabRow}>
        {["Description", "Gallery", "Reviews", "Explore"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- Tab Content ---- */}
      <View style={styles.content}>
        {activeTab === "Description" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.description}>{prop.description}</Text>
          </ScrollView>
        )}

        {activeTab === "Gallery" && (
          <FlatList
            data={prop.otherPhotoURLs || []}
            keyExtractor={(item, index) => `${index}-${item}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
          />
        )}

        {activeTab === "Reviews" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.placeholder}>Reviews coming soon...</Text>
          </ScrollView>
        )}

        {activeTab === "Explore" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.placeholder}>Explore nearby places...</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainImage: { width: "100%", height: windowHeight * 0.35 },
  overlayHeader: {
    position: "absolute",
    top: 40,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  tagRow: { flexDirection: "row", alignItems: "center" },
  tag: {
    backgroundColor: "#FFF4E5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  tagText: { fontSize: 12, fontWeight: "600", color: "#FF8A00" },
  title: { fontSize: 20, fontWeight: "700", marginHorizontal: 16, marginTop: 12 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
  },
  location: { fontSize: 14, color: "#555", marginLeft: 4 },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  blueBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  greenBtn: {
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  likeBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 8,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tab: { alignItems: "center", paddingBottom: 8 },
  tabText: { fontSize: 14, color: "#777" },
  activeTabText: { color: "#007AFF", fontWeight: "600" },
  tabIndicator: {
    height: 2,
    width: "100%",
    backgroundColor: "#007AFF",
    marginTop: 4,
  },
  content: { flex: 1, padding: 16 },
  description: { fontSize: 14, color: "#333", lineHeight: 20 },
  galleryImage: {
    width: "48%",
    height: 120,
    borderRadius: 8,
    margin: "1%",
  },
  placeholder: { fontSize: 14, color: "#666" },
});
