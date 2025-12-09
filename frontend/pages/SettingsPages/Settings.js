// pages/SettingsPages/Settings.js
import React, { useState, useEffect, useRef } from "react";
import { Footer } from "../../components/Footer/Footer";
import headerStyle from "../../components/GlobalStyles/headerStyle";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { settingsUIStyles } from "../../components/GlobalStyles/settingsStyles";
import {
  PersonIcon,
  InfoIcon,
  AppsIcon,
  LogoutIcon,
  ChevronRightIcon,
  BugReportIcon,
} from "../../assets/settings-icons/icons";
import { signOut } from "../../services/authWrapper";
import { auth } from "../../services/firebase";
import { useSafeNavigation } from "../../hooks/useSafeNavigation";

// 1. Import the new CustomAlert component
import CustomAlert from "../../components/settings_components/CustomAlert";

const Settings = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  // Use the safe navigation hook
  const { navigate } = useSafeNavigation();

  // 2. Add state to manage the visibility of the custom alert
  const [isLogoutAlertVisible, setLogoutAlertVisible] = useState(false);

  // --- SAFETY REF (Prevents crash on async actions) ---
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (isMounted.current) {
        setCurrentUserId(currentUser.uid);
      }
      console.log("User ID set on component mount:", currentUser.uid);
    } else {
      console.warn("Settings screen loaded, but no user is authenticated in Firebase.");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logout functionality executed");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Logout failed.");
    }
    
    // Safety check: Only update state if screen is still alive
    if (isMounted.current) {
      setLogoutAlertVisible(false); 
    }
  };

  const handleButtonClick = (id) => {
    if (id === "logout") {
      setLogoutAlertVisible(true);
    } else if (id === "about") {
      navigate("About"); // <--- Updated to use safe navigation
    } else if (id === "account") {
      if (currentUserId) {
        navigate("Account", { userId: currentUserId }); // <--- Updated to use safe navigation
      } else {
        Alert.alert("Error", "Could not find the user ID.");
      }
    } else if (id === "module") {
      navigate("Module"); // <--- Updated to use safe navigation
    } else if (id === "contact") {
      navigate("Contact"); // <--- Updated to use safe navigation
    }
  };

  const SettingsItem = ({ id, icon: IconComponent, title, subtitle, isLogout = false }) => {
    return (
      <TouchableOpacity
        style={[settingsUIStyles.settingsItem]}
        onPress={() => handleButtonClick(id)}
        activeOpacity={0.7}
      >
        <View style={settingsUIStyles.iconContainer}><IconComponent /></View>
        <View style={settingsUIStyles.textContainer}>
          <Text style={[settingsUIStyles.primaryText, isLogout && settingsUIStyles.logoutText]}>{title}</Text>
          <Text style={settingsUIStyles.secondaryText}>{subtitle}</Text>
        </View>
        <View style={{ marginLeft: 8 }}><ChevronRightIcon style={{ color: isLogout ? "#ffcdd2" : "#cccccc" }} size={20} /></View>
      </TouchableOpacity>
    );
  };
  const Divider = () => <View style={settingsUIStyles.divider} />;

  return (
    // --- CRITICAL FIX: collapsable={false} on Root View ---
    <View style={settingsUIStyles.container} collapsable={false}>
      <View style={headerStyle.titleContainer}>
        <Text style={headerStyle.title}>Settings</Text>
      </View>

      <ScrollView style={settingsUIStyles.scrollView}>
        <View style={settingsUIStyles.contentContainer}>
          {/* --- CRITICAL FIX: collapsable={false} on Card Container --- 
              This protects the SVG icons inside from being corrupted by Android's view flattener */}
          <View style={settingsUIStyles.settingsCard} collapsable={false}>
            {/* List of SettingsItems... (unchanged) */}
            <SettingsItem id="account" icon={PersonIcon} title="Account Settings" subtitle="Manage account and personal information" />
            <Divider />
            <SettingsItem id="about" icon={InfoIcon} title="About Application" subtitle="Version, terms, and conditions" />
            <Divider />
            <SettingsItem id="module" icon={AppsIcon} title="Connected Modules" subtitle="Manage modules and connections" />
            <Divider />
            <SettingsItem id="contact" icon={BugReportIcon} title="Contact Page" subtitle="Send feedback or report errors" />
            <Divider />
            <SettingsItem id="logout" icon={LogoutIcon} title="Log Out" subtitle="Sign out of your account" isLogout={true} />
          </View>
          <Footer />
        </View>
      </ScrollView>

      {/* 4. Add the CustomAlert component to your page */}
      <CustomAlert
        visible={isLogoutAlertVisible}
        onClose={() => setLogoutAlertVisible(false)}
        title="Log Out"
        message="Are you sure you want to log out?"
        buttons={[
          {
            text: "Cancel",
            onPress: () => setLogoutAlertVisible(false),
            style: 'default', 
          },
          {
            text: "Log Out",
            onPress: handleLogout,
            style: 'destructive', 
          },
        ]}
      />
    </View>
  );
};

export default Settings;