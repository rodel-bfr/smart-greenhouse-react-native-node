import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import Toast from "react-native-toast-message";
import { toastConfig } from "./components/toastConfig";

// Screens
import HomeScreen from "./pages/HomeScreen";
import StatisticsScreen from "./pages/StatisticsScreen";
import SensorsScreen from "./pages/SensorsScreen";
import Settings from "./pages/SettingsPages/Settings";
import About from "./pages/SettingsPages/About";
import Contact from "./pages/SettingsPages/Contact";
import Account from "./pages/SettingsPages/Account";
import Module from "./pages/SettingsPages/Module";
import SignIn from "./pages/SignIn";
import WelcomeScreen from "./pages/WelcomeScreen";

// Wrapper & Navbar
import ScreenWrapper from "./components/ScreenWrapper";

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !loading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            showWelcome ? (
              <Stack.Screen name="Welcome">
                {(props) => (
                  <WelcomeScreen
                    {...props}
                    onWelcomeFinish={() => setShowWelcome(false)}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                {/* --- MAIN TABS: ANIMATION DISABLED --- */}
                {/* This stops the "snap" effect on the bottom bar */}
                
                <Stack.Screen 
                  name="Home" 
                  options={{ animation: 'none' }} 
                >
                  {() => (
                    <ScreenWrapper>
                      <HomeScreen />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen 
                  name="Sensors" 
                  options={{ animation: 'none' }} 
                >
                  {() => (
                    <ScreenWrapper>
                      <SensorsScreen />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen 
                  name="Statistics" 
                  options={{ animation: 'none' }} 
                >
                  {() => (
                    <ScreenWrapper>
                      <StatisticsScreen />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                <Stack.Screen 
                  name="Settings" 
                  options={{ animation: 'none' }} 
                >
                  {() => (
                    <ScreenWrapper>
                      <Settings />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>

                {/* --- SUB PAGES: KEEP DEFAULT ANIMATION (Slide) --- */}
                {/* These will slide in over the main tabs, which is standard behavior */}

                <Stack.Screen name="About" options={{ animation: 'slide_from_right' }}>
                  {() => (
                    <ScreenWrapper>
                      <About />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Contact" options={{ animation: 'slide_from_right' }}>
                  {() => (
                    <ScreenWrapper>
                      <Contact />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Account" options={{ animation: 'slide_from_right' }}>
                  {() => (
                    <ScreenWrapper>
                      <Account />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
                <Stack.Screen name="Module" options={{ animation: 'slide_from_right' }}>
                  {() => (
                    <ScreenWrapper>
                      <Module />
                    </ScreenWrapper>
                  )}
                </Stack.Screen>
              </>
            )
          ) : (
            <Stack.Screen name="SignIn" options={{ animation: 'fade' }}>
              {(props) => (
                <SignIn
                  {...props}
                  onLoginSuccess={() => setShowWelcome(true)}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}