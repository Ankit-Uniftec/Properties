import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { property } = useLocalSearchParams();
  const prop = JSON.parse(property);

  const [activeTab, setActiveTab] = useState("Description");

  return (
    <View style={styles.container}>
      {/* ---- Main Image ---- */}
      <Image source={{ uri: prop.thumbnailURL }} style={styles.mainImage} />

      {/* ---- Overlay: Back + Tags ---- */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>


      </View>
      <View style={styles.infoRow}>
        {/* Rating (left) */}
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>4.7 (6.8k)</Text>
        </View>

        {/* Rate + Type (right) */}
        <View style={styles.tagRow}>
          {prop.rate && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{prop.rate}</Text>
            </View>
          )}
          {prop.type && (
            <View style={[styles.tag, { backgroundColor: "#EAF4FF" }]}>
              <Text style={[styles.tagText, { color: "#007AFF" }]}>{prop.type}</Text>
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
        <TouchableOpacity
          style={styles.blueBtn}
          onPress={() => router.push({
            pathname: "/RegisterProperty",
            params: { property: JSON.stringify(prop) } // pass current property if needed
          })}
        >
          <Text style={styles.btnText}>Register this property</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.greenBtn}>
          <Text style={styles.btnText}>Interested in buying?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn}>
          <Ionicons name="heart-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>

      {/* ---- Tab Bar ---- */}
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

      {/* ---- Content (depends on tab) ---- */}

      <View style={styles.content}>
        {activeTab === "Description" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.description}>{prop.description}</Text>
          </ScrollView>
        )}

        {activeTab === "Gallery" && (
          <FlatList
            data={prop.otherPhotoURLs}
            keyExtractor={(item, index) => index.toString()}
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

  mainImage: {
    width: "100%",
    height: windowHeight * 0.35,
  },

  overlayHeader: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
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
