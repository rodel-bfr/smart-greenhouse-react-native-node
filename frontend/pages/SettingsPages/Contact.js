// pages/SettingsPages/Contact.js
import React, { useState, useEffect } from "react";
import { Footer } from "../../components/Footer/Footer.js";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, FlatList, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { settingsStyles, contactStyles } from "../../components/GlobalStyles/settingsStyles";
import { SendIcon, ChevronLeftIcon, EmailIcon, WebsiteIcon, ChevronDownIcon } from "../../assets/settings-icons/icons";
import { submitContact } from "../../services/apiClient";

const Contact = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [formData, setFormData] = useState({ title: "", description: "", category: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleLinkPress = async (url) => {
    // Check if the device can handle the URL
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the URL
      await Linking.openURL(url);
    } else {
      // On web, or in case of an error, you can show an alert
      alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const subject = 'Support Request from App';
  const body = 'Hello ByteStorm Team,\n\nI need help with...';
  const mailtoUrl = `mailto:support@bytestorm.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  
  // Define a constant for the header height to use in keyboardVerticalOffset
  const HEADER_HEIGHT = 40; // Adjust this value based on your header's actual height

  const categoryOptions = [
    { value: "light", label: "Light Issues" },
    { value: "pump", label: "Pump Issues" },
    { value: "ventilation", label: "Ventilation Issues" },
    { value: "temperature", label: "Temperature Issues" },
    { value: "humidity", label: "Air Humidity Issues" },
    { value: "soil_humidity", label: "Soil Humidity Issues" },
    { value: "account", label: "Account Issue" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Application Error (Bug)" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    const { category, faultyComponent, greenhouse } = route.params || {};
    if (category) {
      const contactCategory = category.id || "other";
      const presetTitle = `Issue with ${faultyComponent?.name || category.name}`;
      let descriptionText = "";
      if (faultyComponent && greenhouse) {
        descriptionText = 
`Issue Details:
-------------------
Greenhouse: ${greenhouse.name}
Location: ${greenhouse.location}
Component: ${faultyComponent.component_type}
Name: ${faultyComponent.name}
Serial: ${faultyComponent.serial}
Sub-type: ${faultyComponent.type}
-------------------

Please describe below what you have tried and observed:
`;
      }
      setFormData((prev) => ({
        ...prev,
        category: contactCategory,
        title: presetTitle,
        description: descriptionText,
      }));
    }
  }, [route.params]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!formData.title || !formData.description || !formData.category || !formData.email) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      setLoading(false);
      return;
    }

    try {
      const { faultyComponent } = route.params || {};
      const submitData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status: "new",
        source: faultyComponent ? "module_debug" : "contact_page",
      };
      await submitContact(submitData);
      setMessage({ type: "success", text: "Message sent successfully!" });
      setFormData({ title: "", description: "", category: "", email: "" });
    } catch (error) {
      console.error("API Error:", error);
      setMessage({ type: "error", text: error.message || "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToSettings = () => {
    navigation.goBack();
  };

  const headerSubtitleText = route.params?.category
    ? `Support for ${route.params.category.name}`
    : "Leave us a message and we will reply as soon as possible.";

  const CategoryPicker = () => {
    const selectedCategory = categoryOptions.find((option) => option.value === formData.category);
    return (
      <View>
        <TouchableOpacity style={contactStyles.dropdownButton} onPress={() => setShowCategoryPicker(true)}>
          <Text style={selectedCategory ? contactStyles.dropdownButtonText : contactStyles.dropdownButtonPlaceholder}>
            {selectedCategory ? selectedCategory.label : "Select Category"}
          </Text>
          <ChevronDownIcon size={20} style={{ color: "#666" }} />
        </TouchableOpacity>
        <Modal visible={showCategoryPicker} transparent={true} animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                <Text style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>
                  Select Category
                </Text>
              </View>
              <FlatList
                data={categoryOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}
                    onPress={() => {
                      handleChange("category", item.value);
                      setShowCategoryPicker(false);
                    }}>
                    <Text style={{ fontSize: 16, color: formData.category === item.value ? "#2e7d32" : "#333" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={{ padding: 16, alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee" }}
                onPress={() => setShowCategoryPicker(false)}>
                <Text style={{ fontSize: 16, color: "#666" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };
  
  const MessageAlert = ({ message }) => { if (!message.text) return null; const isSuccess = message.type === "success"; return ( <View style={contactStyles.alertContainer}><View style={ isSuccess ? contactStyles.alertSuccess : contactStyles.alertError }><Text style={[ contactStyles.alertText, isSuccess ? contactStyles.alertTextSuccess : contactStyles.alertTextError, ]}>{message.text}</Text></View></View> ); };

  return (
    <View style={settingsStyles.container}>
      {/* 1. The header is fixed and is NOT inside the ScrollView. */}
      <View style={settingsStyles.maxWidthContainer}>
        <View style={settingsStyles.paper}>
          <TouchableOpacity style={settingsStyles.headerBox} onPress={handleBackToSettings} activeOpacity={0.8}>
            <View style={settingsStyles.backIcon}>
              <ChevronLeftIcon size={24} style={{ color: "black" }} />
            </View>
            <View style={settingsStyles.headerContent}>
              <Text style={settingsStyles.headerTitle}>Support and Contact</Text>
              <Text style={settingsStyles.headerSubtitle}>{headerSubtitleText}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. KeyboardAvoidingView wraps ONLY the ScrollView. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // Using "padding" for both platforms is a reliable code-only fix.
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        // 3. This offset tells the view to account for the header's height.
        keyboardVerticalOffset={HEADER_HEIGHT} 
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={settingsStyles.maxWidthContainerScroll}>
            <MessageAlert message={message} />
            <View style={settingsStyles.paper}>
              <View style={settingsStyles.contentBox}>
                <View style={contactStyles.formContainer}>
                  <View style={contactStyles.formField}>
                    <Text style={contactStyles.inputLabelRequired}>Title <Text style={contactStyles.requiredAsterisk}>*</Text></Text>
                    <TextInput style={contactStyles.textInput} placeholder="Briefly describe the subject of the message" value={formData.title} onChangeText={(value) => handleChange("title", value)} returnKeyType="next" />
                  </View>
                  <View style={contactStyles.formField}>
                    <Text style={contactStyles.inputLabelRequired}>Category <Text style={contactStyles.requiredAsterisk}>*</Text></Text>
                    <CategoryPicker />
                  </View>
                  <View style={contactStyles.formField}>
                    <Text style={contactStyles.inputLabelRequired}>Description <Text style={contactStyles.requiredAsterisk}>*</Text></Text>
                    <TextInput style={contactStyles.textInputMultiline} placeholder={"Describe your message in detail here..."} value={formData.description} onChangeText={(value) => handleChange("description", value)} multiline={true} numberOfLines={8} />
                  </View>
                  <View style={contactStyles.formField}>
                    <Text style={contactStyles.inputLabelRequired}>Email <Text style={contactStyles.requiredAsterisk}>*</Text></Text>
                    <TextInput style={contactStyles.textInput} placeholder="Your email address for reply" value={formData.email} onChangeText={(value) => handleChange("email", value)} keyboardType="email-address" autoCapitalize="none" returnKeyType="done" />
                  </View>
                  <TouchableOpacity style={loading ? contactStyles.submitButtonDisabled : contactStyles.submitButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                    <SendIcon size={20} style={{ color: loading ? "#888" : "black" }} />
                    <Text style={loading ? contactStyles.submitButtonTextDisabled : contactStyles.submitButtonText}>
                      {loading ? "Sending..." : "Send Message"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={settingsStyles.paper}>
              <View style={settingsStyles.contentBox}>
                <Text style={contactStyles.contactInfoText}>You can find us at:</Text>
                <View style={contactStyles.contactInfoItem}>
                  <EmailIcon size={16} style={{ color: "rgba(175, 214, 177, 1)" }} />
                  <TouchableOpacity onPress={() => handleLinkPress(mailtoUrl)}>
                    <Text style={contactStyles.contactInfoValue}>
                      support@bytestorm.ro
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={contactStyles.contactInfoItem}>
                  <WebsiteIcon size={16} style={{ color: "rgba(175, 214, 177, 1)" }} />
                  <TouchableOpacity onPress={() => handleLinkPress('https://smartgreenhouse.online/')}>
                    {/* Added an inline style to make it look like a link */}
                    <Text style={contactStyles.contactInfoValue}>
                      smartgreenhouse.online
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Footer />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Contact;