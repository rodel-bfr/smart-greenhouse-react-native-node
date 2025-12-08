import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import GreenhouseCard from "../components/GreenhouseCard";
import { getGreenhouses, getSensors, getUserById } from "../services/apiClient";
import WeatherWidget from "../components/WeatherWidget";
import { useFonts } from "@expo-google-fonts/roboto"; // Removed Roboto_700Bold as it's not used directly
import { auth } from "../services/firebase";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import ConnectionError from "../components/ConnectionError"; // Import the Connection Error Component

const screenWidth = Dimensions.get("window").width;

const avatarImages = {
  "avatar_1.png": require("../assets/avatars/avatar_1.png"),
  "avatar_2.png": require("../assets/avatars/avatar_2.png"),
  "avatar_3.png": require("../assets/avatars/avatar_3.png"),
  "avatar_4.png": require("../assets/avatars/avatar_4.png"),
  "avatar_5.png": require("../assets/avatars/avatar_5.png"),
  "avatar_6.png": require("../assets/avatars/avatar_6.png"),
};

const HomeScreen = () => {
  const { navigate } = useSafeNavigation();

  const [greenhouses, setGreenhouses] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  // State to track connection issues
  const [connectionError, setConnectionError] = useState(false); // New State

  // --- SAFETY REF ---
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = async () => {
    try {
      // Reset error state on new attempt
      setConnectionError(false); 
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("⚠️ No user logged in!");
        if (isMounted.current) setLoading(false);
        return;
      }

      // We fetch data in parallel
      const [ghRes, sRes, userRes] = await Promise.all([
        getGreenhouses(),
        getSensors(),
        getUserById(currentUser.uid),
      ]);

      // Only update state if screen is still mounted
      if (isMounted.current) {
        setGreenhouses(ghRes.data);
        setSensors(sRes.data);
        setUser(userRes.data);
      }
    } catch (e) {
      console.error("Fetch error:", e.message);

      // Catch Network Errors specifically
      // This happens if the IP in config.js is wrong or Backend is down

      const isNetworkError = e.message === "Network Error" || e.code === "ECONNABORTED";
      const isServerError = e.response && e.response.status >= 500; // Catch 500 errors (DB down)

      if (isNetworkError || isServerError) {
        if (isMounted.current) setConnectionError(true);
      }
      
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // When refreshing, we also want to clear any previous connection errors
    setConnectionError(false); 
    loadData();
  };

  // Display the Error Screen if backend is unreachable
  if (connectionError) {
    return (
      <ConnectionError 
        onRetry={() => {
          setLoading(true);
          loadData();
        }} 
      />
    );
  }

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 8 }}>Loading data...</Text>
      </View>
    );
  }

  return (
    // --- CRITICAL FIX: collapsable={false} prevents Native Crash on Navigation ---
    <View style={styles.container} collapsable={false}>
      {/* Header Sticky */}
      <View style={styles.headerSticky}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigate("Account")} // <--- Updated to use safe navigation
        >
          <Text style={styles.userName}>{user.nickname}</Text>
          <Image
            source={
              avatarImages[user.avatar] ||
              require("../assets/avatars/avatar_1.png")
            }
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.greenhousesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Remove clipped subviews is safer for complex navigations
        removeClippedSubviews={false} 
      >
        <WeatherWidget location="Cluj-Napoca" />

        {/* My Greenhouses */}
        <View style={styles.headerContainer}>
          <Text
            style={styles.headerText}
            onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
          >
            Greenhouses
          </Text>
          <View style={[styles.headerLine, { width: textWidth }]} />
        </View>

        {greenhouses.map((gh) => {
          const greenhouseSensors = sensors.filter(
            (s) => String(s.greenhouse_id) === String(gh.id)
          );

          return (
            <GreenhouseCard
              key={gh.id}
              greenhouse={gh}
              sensors={greenhouseSensors}
              onPress={() => console.log("Pressed:", gh.name)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerSticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logo: { height: 40, width: 150 },
  userInfo: { flexDirection: "row", alignItems: "center" },
  userName: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: "#AFD6B1",
    marginRight: 8,
    marginBottom: 3,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginBottom: 3 },

  greenhousesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 80, 
    paddingBottom: 20, 
  },

  headerContainer: { marginTop: 16, marginBottom: 12, marginHorizontal: 16 },
  headerText: {
    fontSize: 22,
    fontFamily: "Roboto_700Bold",
    color: "#000",
    textTransform: "uppercase",
  },
  headerLine: {
    height: 3,
    backgroundColor: "#AFD6B1",
    marginTop: 4,
    borderRadius: 2,
  },
});

export default HomeScreen;