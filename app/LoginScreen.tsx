import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
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
  View,
} from "react-native";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false); // 👈 mode toggle

  const auth = getAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin?.();
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Account Created", "Your account has been created successfully!");
      onLogin?.(); // optional: auto-login after signup
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={require("../Images/LoginPageBackground.jpg")}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={["#ffffff1a", "#2564ebbd"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSignUpMode
            ? "Create a new account"
            : "Please sign in with your email and password"}
        </Text>

        {/* Email */}
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

        {/* Password */}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={isSignUpMode ? handleSignUp : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.continueText}>
              {isSignUpMode ? "Create Account →" : "Continue →"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch between Login / Signup */}
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => setIsSignUpMode(!isSignUpMode)}
        >
          <Text style={{ textAlign: "center", color: "#2563eb" }}>
            {isSignUpMode
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Logins (Optional) */}
        <View style={styles.socialRow}>
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
    height: windowHeight * 0.4,
  },
  gradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flex: 1,
    justifyContent: "flex-end",
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
  eyeIcon: { padding: 4 },
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
