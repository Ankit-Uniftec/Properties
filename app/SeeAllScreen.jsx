import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebase";

export default function SeeAllScreen() {
  const { category } = useLocalSearchParams(); // ✅ get category from navigation
  const [properties, setProperties] = useState([]);
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
              (p) => p.category?.toLowerCase() === category?.toString().toLowerCase()
            );

      setProperties(filtered);
    };

    fetchProperties();
  }, [category]);

  const renderCard = () => (
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
        {item.location?.address || "N/A"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category} Properties</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => renderCard(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    padding: 8,
  },
  cardImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: "500" },
  cardLocation: { fontSize: 12, color: "gray", marginTop: 2 },
});
