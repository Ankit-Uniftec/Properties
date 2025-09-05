import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
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
  const { property } = useLocalSearchParams();
  const prop = property ? JSON.parse(property) : null;
  const [selectedType, setSelectedType] = useState("Farmhouse");
  const [multipleOwners, setMultipleOwners] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  // document states
  const [electricityBill, setElectricityBill] = useState(null);
  const [registryCopy, setRegistryCopy] = useState(null);
  const [otherDocs, setOtherDocs] = useState(null);

  const [loading, setLoading] = useState(false);

  const propertyTypes = [
    { label: "Apartment", icon: "business" },
    { label: "House", icon: "home" },
    { label: "Farmhouse", icon: "leaf" },
    { label: "Floor", icon: "layers" },
    { label: "Office", icon: "briefcase" },
  ];

  // pick document
  const pickDocument = async (setFile) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const doc = result.assets[0]; // 👈 use first asset
        setFile(doc);
      }
    } catch (error) {
      console.log("Document pick error:", error);
    }
  };


  // upload file to firebase storage
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    try {
      // fetch the file and convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, blob);

      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.log("Upload error:", error);
      return null;
    }
  };


  // handle submit
  const handleSubmit = async () => {
    if (!ownerName || !aadharNumber || !propertyAddress) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      // upload docs
      const electricityBillURL = await uploadFile(electricityBill, "documents");
      const registryCopyURL = await uploadFile(registryCopy, "documents");
      const otherDocsURL = await uploadFile(otherDocs, "documents");

      // save to firestore
      const user = auth.currentUser;
      await addDoc(collection(db, "properties"), {
        // Keep original property ID for lookup
        originalPropertyId: prop?.id || null,

        // From PropertyDetailScreen
        title: prop?.title || "",
        thumbnailURL: prop?.thumbnailURL || "",
        location: prop?.location || "",
        rate: prop?.rate || "",
        type: prop?.type || selectedType,
        description: prop?.description || "",
        otherPhotoURLs: prop?.otherPhotoURLs || [],

        // From RegisterProperty form
        address: propertyAddress,
        multipleOwners,
        ownerName,
        aadharNumber,
        documents: {
          electricityBill: electricityBillURL,
          registryCopy: registryCopyURL,
          otherDocs: otherDocsURL,
        },
        ownerId: user ? user.uid : null,

        // Workflow
        status: "pending",
        createdAt: serverTimestamp(),
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
        <Text style={styles.headerTitle}>Register your property ownership</Text>
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
                style={[
                  styles.typeBox,
                  selectedType === type.label && styles.typeBoxSelected,
                ]}
                onPress={() => setSelectedType(type.label)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedType === type.label ? "#007AFF" : "#777"}
                />
                <Text
                  style={[
                    styles.typeText,
                    selectedType === type.label && styles.typeTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Property Address</Text>
          <TextInput
            placeholder="Search your property address"
            style={styles.input}
            value={propertyAddress}
            onChangeText={setPropertyAddress}
          />

          <Text style={styles.label}>Upload Documents</Text>
          <View style={styles.docRow}>
            <TouchableOpacity
              style={styles.docBox}
              onPress={() => pickDocument(setElectricityBill)}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
              <Text style={styles.docText}>
                {electricityBill ? electricityBill.name : "Electricity Bill"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.docBox}
              onPress={() => pickDocument(setRegistryCopy)}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
              <Text style={styles.docText}>
                {registryCopy ? registryCopy.name : "Registry Copy"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.docBox}
              onPress={() => pickDocument(setOtherDocs)}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
              <Text style={styles.docText}>
                {otherDocs ? otherDocs.name : "Other Docs"}
              </Text>
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
              onValueChange={setMultipleOwners}
              trackColor={{ true: "#007AFF", false: "#ccc" }}
            />
          </View>

          <Text style={styles.label}>Owner’s Name</Text>
          <Text style={styles.helperText}>
            (Entered name must match with the name as mentioned on the ownership
            documents)
          </Text>
          <TextInput
            placeholder="Enter owner’s full name"
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
          />

          <Text style={styles.label}>Owner’s Aadhar Number</Text>
          <TextInput
            placeholder="Enter owner’s 12 digit aadhar number"
            style={styles.input}
            keyboardType="numeric"
            maxLength={12}
            value={aadharNumber}
            onChangeText={setAadharNumber}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
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
  },
  backBtn: {
    backgroundColor: "#f1f1f1",
    padding: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    color: "#007AFF",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
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
    borderColor: "#007AFF",
    backgroundColor: "#EAF4FF",
  },
  typeText: { fontSize: 9, marginTop: 4, color: "#777" },
  typeTextSelected: { color: "#007AFF", fontWeight: "600" },

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

  helperText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 12,
  },

  continueBtn: {
    backgroundColor: "#007AFF",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  continueText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
