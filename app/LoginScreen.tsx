import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);



  const handleLogin = async () => {

    setLoading(true);
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // callback when login successful
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require("../Images/LoginPageBackground.jpg")}
        style={styles.headerImage}
        resizeMode="cover"
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={["#ffffff1a", "#2564ebbd"]} // white (80% opacity) → blue (80% opacity)
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Please sign in with your email and password
        </Text>

        {/* Email Input */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Input */}
        {/* Password Input */}
        <View style={styles.passwordBox}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>


        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.continueText}>Continue →</Text>
          )}
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          {/* <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
              }}
              style={{ width: 28, height: 28 }}
            />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={30} />

          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={30} color="#1877F2" />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> &{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  headerImage: {
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    height: windowHeight * 0.4, // 40% of screen height
  },
  gradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

    flex: 1,
    justifyContent: "flex-end", // optional (pushes content to bottom)
  },
  skipButton: {

    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,

  },
  skipText: { color: "white", fontWeight: "500" },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 2 },
  title: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 24,

    textAlign: "center",
  },
  inputBox: { marginBottom: 16 },
  inputBoxRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },

  continueButton: {
    backgroundColor: "#3572EF",
    marginTop: 20,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueText: { color: "white", fontWeight: "600", fontSize: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#ddd" },
  dividerText: { marginHorizontal: 8, color: "#666" },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    padding: 12,
    marginHorizontal: 8,
  },
  terms: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    marginTop: 10,
  },
  link: { color: "#2563eb" },
});
