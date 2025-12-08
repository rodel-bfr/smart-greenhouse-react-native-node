import { useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

export const useSafeNavigation = () => {
  const navigation = useNavigation();
  const isNavigating = useRef(false);

  const navigate = useCallback((screenName, params) => {
    if (isNavigating.current) {
      console.log("Navigation blocked: Debounce active");
      return; 
    }

    isNavigating.current = true;
    navigation.navigate(screenName, params);

    // Block further navigation for 1 second (enough for animations to finish)
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigation]);

  const goBack = useCallback(() => {
    if (isNavigating.current) return;

    isNavigating.current = true;
    navigation.goBack();

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigation]);

  return { navigate, goBack };
};