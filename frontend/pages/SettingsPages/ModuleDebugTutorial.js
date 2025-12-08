import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { settingsStyles, moduleStyles } from "../../components/GlobalStyles/settingsStyles";
import { ChevronLeftIcon } from "../../assets/settings-icons/icons";
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, ToolsIcon } from "../../assets/settings-icons/moduleIcons";

const ModuleDebugTutorial = ({ category, onBack, faultyComponent, greenhouse }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialFinished, setTutorialFinished] = useState(false);
  const navigation = useNavigation();

  const debugSteps = { light: [{ title: "Check the power supply", content: "Ensure that the LED or light sensor receives correct power (3.3V or 5V).", type: "check", tips: ["Use a multimeter to check the voltage", "Check the breadboard connections"] }, { title: "Test the connections", content: "Check if the pins are correctly connected to the microcontroller.", type: "warning", tips: ["Digital pin for LED", "Analog pin for light sensor", "Check continuity with a multimeter"] }, { title: "Check the code", content: "Ensure that you use the correct pin and the appropriate PWM value for the LED in the code.", type: "info", tips: ["digitalWrite() for simple LED", "analogWrite() for PWM control", "analogRead() for sensor"] }, { title: "Test the component", content: "Temporarily replace the component with one you know works.", type: "tools", tips: ["Test with an external LED", "Check the sensor with a flashlight"] }], pump: [{ title: "Check the pump power supply", content: "Pumps usually require 12V. Check the power source.", type: "check", tips: ["Use a separate power supply for the pump", "Check the required amperage"] }, { title: "Test the relay", content: "Check if the relay switches correctly when it receives a signal.", type: "warning", tips: ["Listen for the relay's 'click'", "Measure the voltage at the relay output"] }, { title: "Check the hydraulic connections", content: "Ensure that the tubes are not clogged and that the pump has water to draw in.", type: "info", tips: ["Check the suction filter", "Clean the tubes of any blockages"] }, { title: "Manually test the pump", content: "Connect the pump directly to the power supply to check operation.", type: "tools", tips: ["Watch out for polarity!", "Ensure the pump is not running dry"] }], ventilation: [{ title: "Check the fan power supply", content: "Fans may require 5V or 12V. Check the specifications.", type: "check", tips: ["Read the label on the fan", "Measure the voltage with a multimeter"] }, { title: "Test the PWM", content: "Check the PWM signal for speed control.", type: "warning", tips: ["PWM frequency must be 25kHz", "Check the duty cycle in the code"] }, { title: "Check for obstructions", content: "Ensure the fan is not blocked by objects or dust.", type: "info", tips: ["Clean the fan blades", "Check the bearings"] }, { title: "Test without the microcontroller", content: "Connect the fan directly to the power supply.", type: "tools", tips: ["Respect polarity", "Listen for unusual noises"] }], temperature: [{ title: "Check the sensor type", content: "Identify if you have DS18B20, DHT22, or another type of sensor.", type: "check", tips: ["Read the markings on the sensor", "Check the datasheet"] }, { title: "Check the connections", content: "Digital sensors need a pull-up resistor.", type: "warning", tips: ["4.7kΩ between VCC and data pin for DS18B20", "Check the pin order (VCC, GND, Data)"] }, { title: "Test with simple code", content: "Use a basic code example for testing.", type: "info", tips: ["Print values in the Serial Monitor", "Check if the sensor is detected"] }, { title: "Calibrate the sensor", content: "Compare the readings with a reference thermometer.", type: "tools", tips: ["Test at ambient temperature", "Check the stability of the readings"] }], humidity: [{ title: "Identify the humidity sensor", content: "The most common are DHT11, DHT22, or SHT30.", type: "check", tips: ["DHT11: lower accuracy, cheaper", "DHT22: higher accuracy", "SHT30: I2C communication"] }, { title: "Check the response time", content: "Humidity sensors have slow response time (2-3 seconds).", type: "warning", tips: ["Do not read more frequently than once every 2 seconds", "Wait for stabilization after startup"] }, { title: "Check the testing environment", content: "Test under different humidity conditions.", type: "info", tips: ["Breathe on the sensor to increase humidity", "Use a hairdryer for testing"] }, { title: "Calibrate the readings", content: "Compare with a reference hygro-thermometer.", type: "tools", tips: ["Test at different humidity levels", "Check if the values are within the normal range (20-80%)"] }], soil_humidity: [{ title: "Check the sensor type", content: "Do you have a resistive or capacitive sensor? Capacitive is more durable.", type: "check", tips: ["Resistive: 2 exposed electrodes", "Capacitive: entire plate, no exposed electrodes"] }, { title: "Calibrate in dry air", content: "Reading in dry air represents 0% humidity.", type: "warning", tips: ["Note the value read in the air", "This will be the maximum value (dry soil)"] }, { title: "Calibrate in water", content: "Reading in water represents 100% humidity.", type: "info", tips: ["Submerge the sensor in distilled water", "Note the minimum value", "Do not submerge the electronics!"] }, { title: "Test in real soil", content: "Place the sensor in soil with different humidity levels.", type: "tools", tips: ["Dry, moderately wet, very wet soil", "Check the consistency of the readings", "Clean the sensor after use"] }],
  };
  const currentCategory = debugSteps[category.id] || [];

  const handleContactSupport = () => {
    const serializableCategory = {
      id: category.id,
      name: category.name,
    };

    navigation.navigate("Contact", {
      category: serializableCategory,
      faultyComponent,
      greenhouse,
    });
  };
  
  const handleNextStep = () => {
    const isLastStep = currentStep === currentCategory.length - 1;
    if (isLastStep) {
      // --- THIS IS THE CORRECTED CODE BLOCK ---
      console.log("[1] ModuleDebugTutorial.js: Triggering modal toast..."); // <-- ADD THIS LOG
      Toast.show({
        type: 'modal', // Ensure this is 'modal'
        text1: 'Tutorial finished!',
        text2: 'If the problem persists, you can contact support.',
        autoHide: false,
        onHide: () => {
          // <-- ADD A LOG INSIDE onHide
          console.log("[4] ModuleDebugTutorial.js: onHide callback has been triggered!");
          setTutorialFinished(true);
        },
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStepIcon = (type) => { switch (type) { case "check": return CheckCircleIcon; case "warning": return AlertCircleIcon; case "info": return InfoIcon; case "tools": return ToolsIcon; default: return InfoIcon; } };
  const getStepColor = (type) => { switch (type) { case "check": return "#4caf50"; case "warning": return "#ff9800"; case "info": return "#2196f3"; case "tools": return "#9c27b0"; default: return "#2196f3"; } };
  const StepIndicator = ({ step, index, isActive }) => { const StepIcon = getStepIcon(step.type); const stepColor = getStepColor(step.type); return ( <View style={[moduleStyles.stepIndicator, isActive && moduleStyles.stepIndicatorActive]} > <View style={[ moduleStyles.stepIconContainer, { backgroundColor: isActive ? stepColor + "30" : "#f5f5f5", }, ]} > <StepIcon size={24} style={{ color: isActive ? stepColor : "#999", }} /> </View> <Text style={[ moduleStyles.stepNumber, isActive && moduleStyles.stepNumberActive, ]} > {index + 1} </Text> </View> ); };

  return (
    <View style={settingsStyles.container}>
      <View style={settingsStyles.maxWidthContainer}>
        <View style={settingsStyles.paper}>
          <TouchableOpacity style={settingsStyles.headerBox} onPress={onBack} activeOpacity={0.8}>
            <View style={settingsStyles.backIcon}>
              <ChevronLeftIcon size={24} style={{ color: "black" }} />
            </View>
            <View style={settingsStyles.headerContent}>
              <Text style={settingsStyles.headerTitle}>Troubleshooting {category.name}</Text>
              <Text style={settingsStyles.headerSubtitle}>Step-by-step tutorial</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={settingsStyles.maxWidthContainerScroll}>
          {isTutorialFinished && (
            <View style={settingsStyles.paper}>
              <View style={settingsStyles.contentBox}>
                <View style={moduleStyles.contactSupportSection}>
                  <Text style={moduleStyles.contactSupportTitle}>Does the problem persist?</Text>
                  <Text style={moduleStyles.contactSupportDescription}>
                    If you have followed all troubleshooting steps and the problem was not solved, our technical support team can help you.
                  </Text>
                  <TouchableOpacity style={moduleStyles.contactSupportButton} onPress={handleContactSupport} activeOpacity={0.8}>
                    <Text style={moduleStyles.contactSupportButtonText}>Contact Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {currentCategory[currentStep] && (
            <View style={settingsStyles.paper}>
              <View style={settingsStyles.contentBox}>
                <View style={moduleStyles.currentStepHeader}>
                  <Text style={moduleStyles.currentStepNumber}>Step {currentStep + 1}</Text>
                  <Text style={moduleStyles.currentStepTitle}>{currentCategory[currentStep].title}</Text>
                </View>
                <Text style={moduleStyles.stepContent}>{currentCategory[currentStep].content}</Text>
                {currentCategory[currentStep].tips && (
                  <View style={moduleStyles.tipsContainer}>
                    <Text style={moduleStyles.tipsTitle}>💡 Useful Tips:</Text>
                    {currentCategory[currentStep].tips.map((tip, index) => (
                      <Text key={index} style={moduleStyles.tipText}>• {tip}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={settingsStyles.paper}>
            <View style={settingsStyles.contentBox}>
              <View style={moduleStyles.navigationButtons}>
                <TouchableOpacity
                  style={[moduleStyles.navButton, currentStep === 0 && moduleStyles.navButtonDisabled]}
                  onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  activeOpacity={0.8}
                >
                  <Text style={[moduleStyles.navButtonText, currentStep === 0 && moduleStyles.navButtonTextDisabled]}>
                    ← Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[moduleStyles.navButton]}
                  onPress={handleNextStep}
                  activeOpacity={0.8}
                >
                  <Text style={moduleStyles.navButtonText}>
                    {currentStep === currentCategory.length - 1 ? "Finish" : "Next →"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ModuleDebugTutorial;