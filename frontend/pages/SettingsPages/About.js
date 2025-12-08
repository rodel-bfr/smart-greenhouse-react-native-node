// pages/SettingsPages/About.js
import React, { useState } from "react";
import { Footer } from "../../components/Footer/Footer.js"; // Import Footer component
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Import styles from components/settings_components directory
import {
  settingsStyles,
  aboutStyles,
} from "../../components/GlobalStyles/settingsStyles";

// Import icons from assets/settings-icons directory (go up 2 directories)
import {
  InfoIcon,
  GuideIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "../../assets/settings-icons/icons";

const About = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const navigation = useNavigation();

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleBackToSettings = () => {
    navigation.goBack(); // Go back to Settings page
  };

  const guideItems = [
    {
      id: "navigation",
      title: "Navigation in the application",
      content:
        "Use the main menu to access different sections of the application. Each section is logically organized to give you quick access to the features you need. You can navigate using the top menu or the buttons on the main page.",
    },
    {
      id: "settings",
      title: "Account Settings",
      content:
        "Personalize your experience through the settings page. All changes are saved automatically.",
    },
    {
      id: "modules",
      title: "Connected Modules",
      content:
        "Manage connections with external services through the modules section. You can connect various platforms and services to integrate your data. Each module can be individually configured and enabled/disabled as needed.",
    },
    {
      id: "sync",
      title: "Automatic Synchronization",
      content:
        "Your data is automatically and securely synchronized with our servers. Synchronization is done in real-time to always have updated information. You can check the synchronization status in settings.",
    },
  ];

  // Component for expandable guide item
  const GuideItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];

    return (
      <View style={aboutStyles.dropdownItem}>
        <TouchableOpacity
          style={aboutStyles.dropdownHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={aboutStyles.dropdownHeaderLeft}>
            <CheckIcon size={20} style={{ color: "#4caf50" }} />
            <Text style={aboutStyles.dropdownHeaderText}>{item.title}</Text>
          </View>
          <ChevronDownIcon
            size={20}
            isOpen={isExpanded}
            style={{ color: "#666" }}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={aboutStyles.dropdownContent}>
            <Text style={aboutStyles.dropdownContentText}>{item.content}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={settingsStyles.container}>
      <View style={settingsStyles.maxWidthContainer}>
        {/* Header with back button */}
        <View style={aboutStyles.aboutPaper}>
          <TouchableOpacity
            style={settingsStyles.headerBox}
            onPress={handleBackToSettings}
            activeOpacity={0.8}
          >
            {/* Back icon on the left */}
            <View style={aboutStyles.aboutBackIcon}>
              <ChevronLeftIcon size={24} style={{ color: "black" }} />
            </View>

            {/* Centered content */}
            <View style={settingsStyles.headerContent}>
              <Text style={settingsStyles.headerTitle}>ByteStorm App</Text>
              <Text style={settingsStyles.headerSubtitle}>
                Your management and automation application
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <View style={settingsStyles.maxWidthContainerScroll}>
          {/* About Section */}
          <View style={aboutStyles.aboutPaper}>
            <View style={settingsStyles.contentBox}>
              <View style={aboutStyles.sectionHeader}>
                <InfoIcon size={24} style={{ color: "rgba(175, 214, 177, 1)" }} />
                <Text style={aboutStyles.sectionHeaderText}>
                  About Application
                </Text>
              </View>

              <Text style={aboutStyles.descriptionText}>
                ByteStorm App is a modern application built to simplify and automate your workflows. The application offers an intuitive interface and advanced features to improve your productivity.
              </Text>

              <Text style={aboutStyles.descriptionSecondaryText}>
                Developed with modern technologies, the application ensures high performance, maximum security, and an exceptional user experience.
              </Text>
            </View>
          </View>

          {/* Guide Section */}
          <View style={aboutStyles.aboutPaper}>
            <View style={settingsStyles.contentBox}>
              <View style={aboutStyles.sectionHeader}>
                <GuideIcon size={24} style={{ color: "rgba(175, 214, 177, 1)" }} />
                <Text style={aboutStyles.sectionHeaderText}>
                  How to Use
                </Text>
              </View>

              <View>
                {guideItems.map((item) => (
                  <GuideItem key={item.id} item={item} />
                ))}
              </View>
            </View>
          </View>

          {/* Version Information */}
          <View style={aboutStyles.aboutPaper}>
            <View style={settingsStyles.contentBox}>
              <View style={aboutStyles.versionContainer}>
                <Text style={aboutStyles.versionLabel}>Version</Text>
                <Text style={aboutStyles.versionNumber}>1.0.0 (Portfolio Demo)</Text>
              </View>
            </View>
          </View>

          <Footer />
        </View>
      </ScrollView>
    </View>
  );
};

export default About;