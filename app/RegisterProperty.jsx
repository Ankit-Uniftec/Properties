import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db, storage } from "../firebase";

export default function RegisterProperty() {
  const router = useRouter();
  const { id, selectedFlat } = useLocalSearchParams();
  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flatData, setFlatData] = useState(null);

  const [selectedType, setSelectedType] = useState(null);
  const [multipleOwners, setMultipleOwners] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [owners, setOwners] = useState([]); // New state for multiple owners
  const [propertyAddress, setPropertyAddress] = useState(""); 

  const [electricityBill, setElectricityBill] = useState(null);
  const [registryCopy, setRegistryCopy] = useState(null);
  const [otherDocs, setOtherDocs] = useState(null);

  const propertyTypes = [
    { label: "Apartment", icon: "business" },
    { label: "House", icon: "home" },
    { label: "Farmhouse", icon: "leaf" },
    { label: "Floor", icon: "layers" },
    { label: "Office", icon: "briefcase" },
  ];

  useEffect(() => {
    if (selectedFlat) {
      try {
        setFlatData(JSON.parse(selectedFlat));
        setPropertyAddress(JSON.parse(selectedFlat).address);
      } catch (err) {
        console.log("Error parsing flat:", err);
      }
    }
  }, [selectedFlat]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, "properties", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProp({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }
    };
    fetchProperty();
  }, [id]);

  const pickDocument = async (setFile) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const doc = result.assets[0];
        setFile(doc);
      }
    } catch (error) {
      console.log("Document pick error:", error);
    }
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    try {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, blob);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.log("Upload error:", error);
      return null;
    }
  };

  // 🔹 Add Owner Function
  const handleAddOwner = () => {
    if (!ownerName || !aadharNumber) {
      Alert.alert("Missing Fields", "Please enter both name and Aadhaar.");
      return;
    }

    setOwners((prev) => [...prev, { name: ownerName, aadhar: aadharNumber }]);
    setOwnerName("");
    setAadharNumber("");
  };

  const handleSubmit = async () => {
    if (!propertyAddress || (!multipleOwners && !ownerName) || (multipleOwners && owners.length === 0)) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Upload documents
      const electricityBillURL = await uploadFile(electricityBill, "documents");
      const registryCopyURL = await uploadFile(registryCopy, "documents");
      const otherDocsURL = await uploadFile(otherDocs, "documents");

      let resolvedThumbnailURL = flatData?.thumbnailURL || null;

      if (resolvedThumbnailURL) {
        if (resolvedThumbnailURL.startsWith("https://")) {
          try {
            if (resolvedThumbnailURL.includes("/o/")) {
              const [prefix, rest] = resolvedThumbnailURL.split("/o/");
              const qIdx = rest.indexOf("?");
              const objectPath = qIdx >= 0 ? rest.slice(0, qIdx) : rest;
              const query = qIdx >= 0 ? rest.slice(qIdx) : "";
              let decodedObjectPath = objectPath;
              try {
                decodedObjectPath = decodeURIComponent(objectPath);
              } catch (e) {}
              const encodedObjectPath = encodeURIComponent(decodedObjectPath);
              resolvedThumbnailURL = `${prefix}/o/${encodedObjectPath}${query}`;
            }
          } catch (err) {
            console.log("Error re-encoding thumbnail URL:", err);
          }
        } else {
          try {
            resolvedThumbnailURL = await getDownloadURL(ref(storage, resolvedThumbnailURL));
            if (resolvedThumbnailURL.includes("/o/")) {
              const [prefix, rest] = resolvedThumbnailURL.split("/o/");
              const qIdx = rest.indexOf("?");
              const objectPath = qIdx >= 0 ? rest.slice(0, qIdx) : rest;
              const query = qIdx >= 0 ? rest.slice(qIdx) : "";
              let decodedObjectPath = objectPath;
              try {
                decodedObjectPath = decodeURIComponent(objectPath);
              } catch (e) {}
              const encodedObjectPath = encodeURIComponent(decodedObjectPath);
              resolvedThumbnailURL = `${prefix}/o/${encodedObjectPath}${query}`;
            }
          } catch (err) {
            console.log("Failed to get thumbnail URL from storage path:", err);
            resolvedThumbnailURL = null;
          }
        }
      }

      const user = auth.currentUser;

      await addDoc(collection(db, "registeredFlats"), {
        propertyId: flatData?.propertyId || null,
        flatName: flatData?.flatName,
        floorName: flatData?.floorName,
        towerName: flatData?.towerName,
        faddress: flatData?.faddress || null,

        multipleOwners,
        owners: multipleOwners
          ? owners
          : [{ name: ownerName, aadhar: aadharNumber }],

        ownerId: user ? user.uid : null,

        documents: {
          electricityBill: electricityBillURL,
          registryCopy: registryCopyURL,
          otherDocs: otherDocsURL,
        },

        address: propertyAddress,
        status: "pending",
        createdAt: serverTimestamp(),

        title: flatData?.title || "",
        thumbnailURL: resolvedThumbnailURL || "",
        rate: flatData?.rate || 0,
        type: selectedType,
      });

      setLoading(false);
      Alert.alert("Success", "Property registered successfully!");
      router.back();
    } catch (error) {
      setLoading(false);
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save property.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register your property {`\n`}ownership</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Details */}
        <Text style={styles.sectionTitle}>Property Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Type of Property</Text>
          <View style={styles.typeRow}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.label}
                style={[styles.typeBox, selectedType === type.label && styles.typeBoxSelected]}
                onPress={() => setSelectedType(type.label)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedType === type.label ? "#3572EF" : "#777"}
                />
                <Text
                  style={[styles.typeText, selectedType === type.label && styles.typeTextSelected]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Property Address</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() =>
              router.push({
                pathname: "/TowerSelectionScreen",
                params: { propertyId: prop?.id },
              })
            }
          >
            <Text style={{ color: propertyAddress ? "#000" : "#aaa" }}>
              {propertyAddress || "Click here to select your property"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Upload Documents</Text>
          <View style={styles.docRow}>
            <TouchableOpacity style={styles.docBox} onPress={() => pickDocument(setElectricityBill)}>
              <Ionicons name="add" size={24} color="#3572EF" />
              <Text style={styles.docText}>{electricityBill ? electricityBill.name : "Electricity Bill"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.docBox} onPress={() => pickDocument(setRegistryCopy)}>
              <Ionicons name="add" size={24} color="#3572EF" />
              <Text style={styles.docText}>{registryCopy ? registryCopy.name : "Registry Copy"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.docBox} onPress={() => pickDocument(setOtherDocs)}>
              <Ionicons name="add" size={24} color="#3572EF" />
              <Text style={styles.docText}>{otherDocs ? otherDocs.name : "Other Docs"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ownership Details */}
        <Text style={styles.sectionTitle}>Ownership Details</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Multiple Owners</Text>
            <Switch
              value={multipleOwners}
              onValueChange={(val) => {
                setMultipleOwners(val);
                if (!val) setOwners([]);
              }}
              trackColor={{ true: "#3572EF", false: "#ccc" }}
            />
          </View>

          <Text style={styles.label}>Owner’s Name</Text>
          <TextInput
            placeholder="Enter owner’s full name"
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
          />

          <Text style={styles.label}>Owner’s Aadhar Number</Text>
          <TextInput
            placeholder="Enter 12 digit aadhar number"
            style={styles.input}
            keyboardType="numeric"
            maxLength={12}
            value={aadharNumber}
            onChangeText={setAadharNumber}
          />

          {multipleOwners && (
            <TouchableOpacity
              style={[styles.continueBtn, { marginTop: 6, backgroundColor: "#3572EF" }]}
              onPress={handleAddOwner}
            >
              <Text style={styles.continueText}>+ Add Owner</Text>
            </TouchableOpacity>
          )}

          {multipleOwners && owners.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {owners.map((o, idx) => (
                <Text key={idx} style={{ fontSize: 13, marginBottom: 4 }}>
                  👤 {o.name} - {o.aadhar}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueText}>Continue</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    padding: 16,
    marginTop: 25,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  backBtn: {
    backgroundColor: "#f1f1f1",
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginLeft: 12,
    color: "#3572EF",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3572EF",
    marginTop: 12,
    marginBottom: 6,
    marginHorizontal: 16,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeBox: {
    alignItems: "center",
    borderWidth: 1,
    height: 70,
    justifyContent: "center",
    borderColor: "#ccc",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  typeBoxSelected: {
    borderColor: "#3572EF",
    backgroundColor: "#EAF4FF",
  },
  typeText: { fontSize: 9, marginTop: 4, color: "#777" },
  typeTextSelected: { color: "#3572EF", fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },

  docRow: { flexDirection: "row", justifyContent: "space-between" },
  docBox: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  docText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#555",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  continueBtn: {
    backgroundColor: "#3572EF",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  continueText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
