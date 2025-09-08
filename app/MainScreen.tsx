// import { Feather, Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import React, { useEffect, useState } from "react";
// import {
//   FlatList,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // 🔹 Firebase imports
// import { useRouter } from "expo-router"; // ✅ navigation
// import { collection, getDocs } from "firebase/firestore";
// import { auth, db } from "../firebase";

// export default function MainScreen() {
//   const [location, setLocation] = useState<string>("Fetching...");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [properties, setProperties] = useState<any[]>([]);
//   const router = useRouter(); // ✅ router hook

//   // ✅ Fetch user location
//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setLocation("Permission denied");
//         return;
//       }
//       let loc = await Location.getCurrentPositionAsync({});
//       let address = await Location.reverseGeocodeAsync(loc.coords);
//       if (address.length > 0) {
//         setLocation(
//           `${address[0].district}, ${address[0].city || address[0].region}`
//         );
//       }
//     })();
//   }, []);

//   // ✅ Fetch properties from Firestore
//   useEffect(() => {
//     const fetchProperties = async () => {
//       const querySnapshot = await getDocs(collection(db, "properties"));
//       const data = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setProperties(data as any);
//     };
//     fetchProperties();
//   }, []);

//   // ✅ Firebase Auth user
//   const user = auth.currentUser;

//   // ✅ Filtering logic
//   const filteredProperties =
//     selectedCategory === "All"
//       ? properties
//       : properties.filter(
//           (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
//         );

//   // ✅ Card Renderer with Navigation
//   const renderCard = (item: any) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         router.push({
//           pathname: "/PropertyDetailScreen",
//           params: { property: JSON.stringify(item) }, // ✅ pass property
//         })
//       }
//     >
//       <Image source={{ uri: item.thumbnailURL }} style={styles.cardImage} />
//       <Text style={styles.cardTitle}>{item.title}</Text>
//       <Text style={styles.cardTitle}>
//         <Ionicons name="location-outline" size={10} color="black" />{" "}
//         {item.location}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <FlatList
//       key={selectedCategory === "All" ? "one-column" : "two-columns"}
//       data={selectedCategory === "All" ? [] : filteredProperties}
//       keyExtractor={(item) => item.id}
//       numColumns={selectedCategory === "All" ? 1 : 2}
//       renderItem={
//         selectedCategory === "All"
//           ? null
//           : ({ item }) => renderCard(item)
//       }
//       ListHeaderComponent={
//         <View style={styles.container}>
//           {/* ---- Header ---- */}
//           <View style={styles.header}>
//             <View>
//               <Text style={styles.locationLabel}>Location</Text>
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Ionicons name="location-outline" size={16} color="#007AFF" />
//                 <Text style={styles.locationText}>{location}</Text>
//               </View>
//             </View>

//             <View style={styles.headerIcons}>
//               <TouchableOpacity>
//                 <Ionicons name="qr-code-outline" size={22} color="#333" />
//               </TouchableOpacity>
//               <TouchableOpacity style={{ marginLeft: 15 }}>
//                 <Ionicons name="notifications-outline" size={22} color="#333" />
//               </TouchableOpacity>
//               <TouchableOpacity style={{ marginLeft: 15 }}>
//                 {user?.photoURL ? (
//                   <Image source={{ uri: user.photoURL }} style={styles.avatar} />
//                 ) : (
//                   <Ionicons
//                     name="person-circle-outline"
//                     size={28}
//                     color="#333"
//                   />
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ---- Search Bar ---- */}
//           <View style={styles.searchContainer}>
//             <Ionicons
//               name="search-outline"
//               size={18}
//               color="#888"
//               style={{ marginRight: 6 }}
//             />
//             <TextInput style={styles.searchInput} placeholder="Search here" />
//             <TouchableOpacity>
//               <Feather name="sliders" size={20} color="#007AFF" />
//             </TouchableOpacity>
//           </View>

//           {/* ---- Carousel ---- */}
//           <ScrollView
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             style={styles.carousel}
//           >
//             {properties.map((item) => (
//               <TouchableOpacity
//                 key={item.id}
//                 onPress={() =>
//                   router.push({
//                     pathname: "/PropertyDetailScreen",
//                     params: { property: JSON.stringify(item) },
//                   })
//                 }
//               >
//                 <Image
//                   source={{ uri: item.thumbnailURL }}
//                   style={styles.carouselImage}
//                 />
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           {/* ---- Category Buttons ---- */}
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.categories}
//           >
//             {["All", "New Project", "Luxury Project", "Most Viewed"].map(
//               (cat) => (
//                 <TouchableOpacity
//                   key={cat}
//                   style={[
//                     styles.categoryBtn,
//                     selectedCategory.toLowerCase() === cat.toLowerCase() &&
//                       styles.categoryActive,
//                   ]}
//                   onPress={() => setSelectedCategory(cat)}
//                 >
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       selectedCategory.toLowerCase() === cat.toLowerCase() &&
//                         styles.categoryTextActive,
//                     ]}
//                   >
//                     {cat}
//                   </Text>
//                 </TouchableOpacity>
//               )
//             )}
//           </ScrollView>

//           {/* ---- Sections when category = all ---- */}
//           {selectedCategory === "All" && (
//             <>
//               {/* New Projects */}
//               <View style={styles.section}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>New Projects</Text>
//                   <TouchableOpacity>
//                     <Text style={styles.seeAll}>See All</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <FlatList
//                   horizontal
//                   data={properties.filter((p) => p.category === "New Project")}
//                   renderItem={({ item }) => renderCard(item)}
//                   keyExtractor={(item) => item.id}
//                   showsHorizontalScrollIndicator={false}
//                 />
//               </View>

//               {/* Luxury Projects */}
//               <View style={styles.section}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>Luxury Projects</Text>
//                   <TouchableOpacity>
//                     <Text style={styles.seeAll}>See All</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <FlatList
//                   horizontal
//                   data={properties.filter((p) => p.category === "Luxury Project")}
//                   renderItem={({ item }) => renderCard(item)}
//                   keyExtractor={(item) => item.id}
//                   showsHorizontalScrollIndicator={false}
//                 />
//               </View>
//             </>
//           )}
//         </View>
//       }
//     />
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 40,
//   },
//   locationLabel: { fontSize: 12, color: "#888" },
//   locationText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
//   headerIcons: { flexDirection: "row", alignItems: "center" },
//   avatar: { width: 28, height: 28, borderRadius: 14 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f1f1f1",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     marginTop: 16,
//   },
//   searchInput: { flex: 1, paddingVertical: 8 },
//   carousel: { marginTop: 20 },
//   carouselImage: {
//     width: 320,
//     height: 160,
//     borderRadius: 12,
//     marginRight: 12,
//   },
//   categories: { marginTop: 20, flexDirection: "row" },
//   categoryBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     backgroundColor: "#f0f0f0",
//     marginRight: 8,
//   },
//   categoryActive: { backgroundColor: "#007AFF" },
//   categoryText: { fontSize: 13, color: "#333" },
//   categoryTextActive: { color: "#fff", fontWeight: "600" },
//   section: { marginTop: 20 },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "600" },
//   seeAll: { fontSize: 13, color: "#007AFF" },
//   card: {
//     width: 180,
//     marginRight: 12,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     padding: 8,
//   },
//   cardImage: { width: "100%", height: 90, borderRadius: 8, marginBottom: 6 },
//   cardTitle: { fontSize: 13, fontWeight: "500" },
// });
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🔹 Firebase imports
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function MainScreen() {
  const [location, setLocation] = useState<string>("Fetching...");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [properties, setProperties] = useState<any[]>([]);
  const router = useRouter();

  // ✅ Fetch user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync(loc.coords);
      if (address.length > 0) {
        setLocation(
          `${address[0].district}, ${address[0].city || address[0].region}`
        );
      }
    })();
  }, []);

  // ✅ Fetch properties from Firestore
  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),   // ✅ ensures thumbnailURL + otherPhotoURLs included
      }));
      setProperties(data as any);
    };
    fetchProperties();
  }, []);

  const user = auth.currentUser;

  // ✅ Filtering logic
  const filteredProperties =
    selectedCategory === "All"
      ? properties
      : properties.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  // ✅ Card Renderer with Navigation
  const renderCard = (item: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/PropertyDetailScreen",
          params: { id: item.id }, // ✅ full property with thumbnail + gallery
        })
      }
    >
      <Image source={{ uri: item.thumbnailURL }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardTitle}>
        <Ionicons name="location-outline" size={10} color="black" />{" "}
        {item.location}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      key={selectedCategory === "All" ? "one-column" : "two-columns"}
      data={selectedCategory === "All" ? [] : filteredProperties}
      keyExtractor={(item) => item.id}
      numColumns={selectedCategory === "All" ? 1 : 2}
      renderItem={
        selectedCategory === "All"
          ? null
          : ({ item }) => renderCard(item)
      }
      ListHeaderComponent={
        <View style={styles.container}>
          {/* ---- Header ---- */}
          <View style={styles.header}>
            <View>
              <Text style={styles.locationLabel}>Location</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="location-outline" size={16} color="#007AFF" />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity>
                <Ionicons name="qr-code-outline" size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                <Ionicons name="notifications-outline" size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color="#333"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ---- Search Bar ---- */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#888"
              style={{ marginRight: 6 }}
            />
            <TextInput style={styles.searchInput} placeholder="Search here" />
            <TouchableOpacity>
              <Feather name="sliders" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* ---- Carousel ---- */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {properties.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/PropertyDetailScreen",
                    params: { id:item.id },
                  })
                }
              >
                <Image
                  source={{ uri: item.thumbnailURL }}
                  style={styles.carouselImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ---- Category Buttons ---- */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categories}
          >
            {["All", "New Project", "Luxury Project", "Most Viewed"].map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    selectedCategory.toLowerCase() === cat.toLowerCase() &&
                      styles.categoryActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory.toLowerCase() === cat.toLowerCase() &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* ---- Sections when category = all ---- */}
          {selectedCategory === "All" && (
            <>
              {/* New Projects */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>New Projects</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={properties.filter((p) => p.category === "New Project")}
                  renderItem={({ item }) => renderCard(item)}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              {/* Luxury Projects */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Luxury Projects</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={properties.filter((p) => p.category === "Luxury Project")}
                  renderItem={({ item }) => renderCard(item)}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },
  locationLabel: { fontSize: 12, color: "#888" },
  locationText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  searchInput: { flex: 1, paddingVertical: 8 },
  carousel: { marginTop: 20 },
  carouselImage: {
    width: 320,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
  categories: { marginTop: 20, flexDirection: "row" },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryActive: { backgroundColor: "#007AFF" },
  categoryText: { fontSize: 13, color: "#333" },
  categoryTextActive: { color: "#fff", fontWeight: "600" },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  seeAll: { fontSize: 13, color: "#007AFF" },
  card: {
    width: 180,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 8,
  },
  cardImage: { width: "100%", height: 90, borderRadius: 8, marginBottom: 6 },
  cardTitle: { fontSize: 13, fontWeight: "500" },
});
