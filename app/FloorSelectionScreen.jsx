import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase";

export default function FloorSelectionScreen() {
  const { propertyId, towerIndex, towerName } = useLocalSearchParams();
  const router = useRouter();

  const [floors, setFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [expandedFloor, setExpandedFloor] = useState(null);
  const [property, setProperty] = useState(null);
  const [registeredFlats, setRegisteredFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // helper: normalize flat names for comparison
  const normalize = (s) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId || towerIndex === undefined) return;
      setLoading(true);

      try {
        // fetch property doc
        const propRef = doc(db, "properties", propertyId);
        const propSnap = await getDoc(propRef);

        if (propSnap.exists()) {
          const propData = { id: propSnap.id, ...propSnap.data() };
          setProperty(propData);

          // build floors
          const selectedTower = propData.towers?.[parseInt(towerIndex)];
          let floorList = selectedTower?.floors || [];
          floorList.sort((a, b) => a.floorNumber - b.floorNumber);

          let shiftedFloors = [
            { floorNumber: 0, flats: floorList[0]?.flats || [] },
            ...floorList.map((floor, idx) => ({
              ...floor,
              flats: floorList[idx + 1]?.flats || [],
            })),
          ];
          shiftedFloors = shiftedFloors.filter((f) => f.flats && f.flats.length > 0);

          setFloors(shiftedFloors);
          setFilteredFloors(shiftedFloors); // ✅ show all initially
        } else {
          setFloors([]);
          setFilteredFloors([]);
          setProperty(null);
        }

        // ✅ fetch all registeredFlats (no propertyId filter)
        const regsSnap = await getDocs(collection(db, "registeredFlats"));
        const regs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRegisteredFlats(regs);
      } catch (err) {
        console.error("Error fetching floors or registeredFlats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, towerIndex]);

  // 🔍 filter floors by search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFloors(floors);
    } else {
      const results = floors.filter((f) =>
        getFloorLabel(f.floorNumber).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFloors(results);
    }
  }, [searchQuery, floors]);

  const getFloorLabel = (num) => {
    if (num === 0) return "Ground Floor";
    if (num === 1) return "1st Floor";
    if (num === 2) return "2nd Floor";
    if (num === 3) return "3rd Floor";
    return `${num}th Floor`;
  };

  // navigate to RegisterProperty (blocked if registered)
  const handleSelectFlat = (flat) => {
    if (flat.registered) return;

    const fullAddress = `${towerName}${flat.flatName}, ${flat.floorName}`;
    const completeAddress = `${property.location.address}, ${property.location.state} ${property.location.pincode}`;
    router.push({
      pathname: "/RegisterProperty",
      params: {
        selectedFlat: JSON.stringify({
          ...flat,
          propertyId,
          address: completeAddress,
          faddress: fullAddress,
          title: property?.title,
          rate: property?.rate,
          thumbnailURL: property?.thumbnailURL,
        }),
      },
    });
  };

  const renderFlats = (flats, floorNumber) => {
    if (!flats || flats.length === 0) return null;

    return (
      <View style={{ marginLeft: 15, marginTop: 8 }}>
        {flats.map((flatNo, idx) => {
          const flatKey = normalize(flatNo);

          // check if this flat exists in registeredFlats (match flat + tower + property)
          const reg = registeredFlats.find((r) => {
            const candidates = [
              r.flatName,
              r.flat_no,
              r.flatNumber,
              r.flat,
              r.flatNo,
              r.unit,
              r.unitNumber,
              r.name,
              r.address,
            ];

            const flatMatch = candidates.some((c) => normalize(c) === flatKey);
            const towerMatch = r.towerName === towerName;
            const propertyMatch = r.propertyId === propertyId;

            return flatMatch && towerMatch && propertyMatch;
          });

          const item = {
            flatName: flatNo,
            floorName: getFloorLabel(floorNumber),
            towerName,
            thumbnailURL: property?.thumbnailURL,
            location: property
              ? `${property.location.address}, ${property.location.city}, ${property.location.state} ${property.location.pincode}`
              : "",
            rate: property?.rate,
            title: property?.title,
            registered: !!reg,
            // ownerName: reg?.ownerName || "Hidden",
            ownerName:reg?.owners.map((item)=>{return item.name}) || "Hidden",
          };

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.card, item.registered && { opacity: 0.6 }]}
              disabled={item.registered}
              onPress={() => handleSelectFlat(item)}
            >
              <Image source={{ uri: item.thumbnailURL }} style={styles.thumbnail} />
              <View style={styles.info}>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <Text style={styles.flatTitle}>
                  {item.flatName}, {item.floorName}
                </Text>
                <Text style={styles.location}>{item.location}</Text>

                <Text style={styles.owner}>
                  {item.registered ? `Owner: ${item.ownerName}` : `Est. Value ${item.rate}`}
                </Text>
              </View>

              <View
                style={[
                  styles.tag,
                  { backgroundColor: item.registered ? "#3572EF" : "#D3C948" },
                ]}
              >
                <Text style={styles.tagText}>
                  {item.registered ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3572EF" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Property not found</Text>
      </View>
    );
  }

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
          placeholder="Search by floor (e.g., 1st, Ground)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.title}>Tower {towerName}</Text>

      <FlatList
        data={filteredFloors}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.floorBox}
              onPress={() =>
                setExpandedFloor(expandedFloor === item.floorNumber ? null : item.floorNumber)
              }
            >
              <Text style={styles.floorText}>{getFloorLabel(item.floorNumber)}</Text>
            </TouchableOpacity>

            {expandedFloor === item.floorNumber && renderFlats(item.flats, item.floorNumber)}
          </View>
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
    color: "#3572EF",
  },
  floorBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#3572EF",
    borderRadius: 8,
    marginVertical: 6,
  },
  floorText: { fontSize: 14, fontWeight: "300", color: "#5A5D6C" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    position: "relative",
  },
  thumbnail: { width: 90, height: 90, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  projectTitle: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 2,
  },
  flatTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  location: { fontSize: 10, color: "#666", marginBottom: 2 },
  owner: { fontSize: 10, fontWeight: "500", color:"#3572EF" },
  tag: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8, 
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { color: "#fff", fontSize: 10, fontWeight: "500" },
});
