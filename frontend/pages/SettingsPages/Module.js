import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { settingsStyles, moduleStyles } from "../../components/GlobalStyles/settingsStyles";
import { ChevronLeftIcon, ChevronRightIcon } from "../../assets/settings-icons/icons";
import { LightIcon, PumpIcon, VentilationIcon, TemperatureIcon, HumidityIcon, SoilHumidityIcon } from "../../assets/settings-icons/moduleIcons";
import ModuleDebugTutorial from "./ModuleDebugTutorial";

const Module = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- MODIFIED ---
  // Get route params, including the new 'initialCategoryId'
  const route = useRoute();
  const { faultyComponent, greenhouse, initialCategoryId } = route.params || {};

  // --- ADDED ---
  // This hook runs when the component loads or when initialCategoryId changes.
  // It automatically selects the correct category if an ID is passed.
  useEffect(() => {
    if (initialCategoryId) {
      const targetCategory = categories.find(c => c.id === initialCategoryId);
      if (targetCategory) {
        setSelectedCategory(targetCategory);
      }
    }
  }, [initialCategoryId]);

  const handleBackToSettings = () => {
    navigation.goBack();
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const categories = [
    { id: "light", name: "Light", description: "Light sensors and LEDs", icon: LightIcon, color: "#ffa726" },
    { id: "pump", name: "Pump", description: "Pumping and irrigation systems", icon: PumpIcon, color: "#42a5f5" },
    { id: "ventilation", name: "Ventilation", description: "Fans and air systems", icon: VentilationIcon, color: "#66bb6a" },
    { id: "temperature", name: "Temperature", description: "Temperature sensors", icon: TemperatureIcon, color: "#ef5350" },
    { id: "humidity", name: "Air Humidity", description: "Atmospheric humidity sensors", icon: HumidityIcon, color: "#26c6da" },
    { id: "soil_humidity", name: "Soil Humidity", description: "Soil humidity sensors", icon: SoilHumidityIcon, color: "#8d6e63" },
  ];

  const CategoryItem = ({ category }) => (
    <TouchableOpacity
      style={moduleStyles.categoryItem}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <View style={[moduleStyles.categoryIconContainer, { backgroundColor: category.color + "20" }]}>
        <category.icon size={32} style={{ color: category.color }} />
      </View>
      <View style={moduleStyles.categoryTextContainer}>
        <Text style={moduleStyles.categoryTitle}>{category.name}</Text>
        <Text style={moduleStyles.categoryDescription}>{category.description}</Text>
      </View>
      <View style={moduleStyles.categoryArrow}>
        <ChevronRightIcon size={20} style={{ color: "#cccccc" }} />
      </View>
    </TouchableOpacity>
  );

  const CategoryDivider = () => <View style={moduleStyles.categoryDivider} />;

  if (selectedCategory) {
    return (
      // Pass the faultyComponent and greenhouse data to the tutorial
      <ModuleDebugTutorial
        category={selectedCategory}
        onBack={handleBackToCategories}
        faultyComponent={faultyComponent}
        greenhouse={greenhouse}
      />
    );
  }

  return (
    <View style={settingsStyles.container}>
      <View style={settingsStyles.maxWidthContainer}>
        <View style={settingsStyles.paper}>
          <TouchableOpacity
            style={settingsStyles.headerBox}
            onPress={handleBackToSettings}
            activeOpacity={0.8}
          >
            <View style={settingsStyles.backIcon}>
              <ChevronLeftIcon size={24} style={{ color: "black" }} />
            </View>
            <View style={settingsStyles.headerContent}>
              <Text style={settingsStyles.headerTitle}>Connected Modules</Text>
              <Text style={settingsStyles.headerSubtitle}>
                Troubleshoot sensors and actuators
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <View style={settingsStyles.maxWidthContainerScroll}>
          <View style={settingsStyles.paper}>
            <View style={settingsStyles.contentBox}>
              <Text style={moduleStyles.infoTitle}>How does it work?</Text>
              <Text style={moduleStyles.infoText}>
                Select the category corresponding to the component you are having problems with. You will be guided through a step-by-step tutorial to identify and solve common issues.
              </Text>
            </View>
          </View>
          <View style={settingsStyles.paper}>
            <View style={settingsStyles.contentBox}>
              <Text style={moduleStyles.sectionTitle}>
                Select the category for troubleshooting:
              </Text>
              <View style={moduleStyles.categoriesContainer}>
                {categories.map((category, index) => (
                  <React.Fragment key={category.id}>
                    <CategoryItem category={category} />
                    {index < categories.length - 1 && <CategoryDivider />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Module;