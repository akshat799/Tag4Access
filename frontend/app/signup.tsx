import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const SignUpScreen = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name*"
          value={form.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
          autoCapitalize="words"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email Address*"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number*"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => handleChange("phone", text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Date of Birth* (YYYY-MM-DD)"
          value={form.dob}
          onChangeText={(text) => handleChange("dob", text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Age*"
          keyboardType="numeric"
          value={form.age}
          onChangeText={(text) => handleChange("age", text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Gender*"
          value={form.gender}
          onChangeText={(text) => handleChange("gender", text)}
        />
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Security</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Password* (minimum 6 characters)"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password*"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Security Question*"
          value={form.securityQuestion}
          onChangeText={(text) => handleChange("securityQuestion", text)}
          multiline
        />
        
        <TextInput
          style={styles.input}
          placeholder="Security Answer*"
          value={form.securityAnswer}
          onChangeText={(text) => handleChange("securityAnswer", text)}
        />
      </View>

      {/* Terms and Register */}
      <View style={styles.section}>
        <Text style={styles.termsText}>
          By creating an account, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Already have an account? <Text style={styles.link}>Sign In</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: -0.5,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    minHeight: 50,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  termsText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 16,
  },
  link: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default SignUpScreen;
