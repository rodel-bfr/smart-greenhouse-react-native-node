import React, { useEffect, useState, useMemo, useRef } from "react";
import headerStyle from "../components/GlobalStyles/headerStyle";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  getGreenhouses,
  getSensorsByGreenhouse,
  getActuatorsByGreenhouse,
} from "../services/apiClient";
import { useSafeNavigation } from "../hooks/useSafeNavigation";

const SensorsScreen = () => {
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState("");
  const [sensors, setSensors] = useState([]);
  const [actuators, setActuators] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { navigate } = useSafeNavigation();

  // --- SAFETY REF ---
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchGreenhouses = async () => {
      try {
        const response = await getGreenhouses();
        if (isMounted.current) {
          const fetchedGreenhouses = response.data;
          setGreenhouses(fetchedGreenhouses);

          if (fetchedGreenhouses.length > 0) {
            setSelectedGreenhouse(fetchedGreenhouses[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading greenhouses:", error);
      }
    };
    fetchGreenhouses();
  }, []);

  const selectedGreenhouseObject = useMemo(() => {
    return greenhouses.find(s => s.id === selectedGreenhouse);
  }, [greenhouses, selectedGreenhouse]);

  useEffect(() => {
    if (!selectedGreenhouse) {
      if(isMounted.current) {
        setSensors([]);
        setActuators([]);
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [sensorsRes, actuatorsRes] = await Promise.all([
          getSensorsByGreenhouse(selectedGreenhouse),
          getActuatorsByGreenhouse(selectedGreenhouse),
        ]);

        if (!isMounted.current) return;

        const sensorsWithStatus = sensorsRes.data.map((sensor) => ({
          ...sensor,
          component_type: 'Sensor', 
          Status: sensor.technical_status || "unknown",
          serial: sensor.serial_number || "unspecified",
        }));

        const actuatorsWithStatus = actuatorsRes.data.map((actuator) => ({
          ...actuator,
          component_type: 'Actuator',
          Status: actuator.technical_status || "unknown",
          serial: actuator.serial_number || "unspecified",
        }));

        setSensors(sensorsWithStatus);
        setActuators(actuatorsWithStatus);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if(isMounted.current) setLoading(false);
      }
    };

    fetchData();
  }, [selectedGreenhouse]);

  const getCategoryForType = (type) => {
    const typeMap = {
      light: "light",
      pump: "pump",
      fan: "ventilation", 
      humidity: "humidity",
      soil_moisture: "soil_humidity",
      temperature: "temperature",
    };
    return typeMap[type.toLowerCase()] || null; 
  };
  
  const handleStareClick = (item, greenhouse) => {
    const categoryId = getCategoryForType(item.type); 

    if (categoryId) {
      navigate("Module", {
        faultyComponent: item,
        greenhouse: greenhouse,
        initialCategoryId: categoryId, 
      });
    } else {
      console.warn(`Unknown component type "${item.type}", navigating to generic module page.`);
      navigate("Module", {
        faultyComponent: item,
        greenhouse: greenhouse,
      });
    }
  };

  const translateStatus = (status) => {
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus === 'functional') return 'Functional';
    if (lowerCaseStatus === 'unfunctional') return 'Unfunctional';
    return status;
  };

  const renderBox = (item) => {
    const Status = item.Status || "unknown";
    const translatedStatus = translateStatus(Status);
    const serial = item.serial || "unspecified";
    const isDefect = Status.toLowerCase() === "unfunctional";

    return (
      <View key={item.id} style={styles.box} collapsable={false}>
        <Text style={styles.boxTitle}>
          {item.component_type}: {item.name || ""}
        </Text>
        <Text style={styles.boxText}>Serial: {serial}</Text>
        <Text style={styles.boxText}>Status: {translatedStatus}</Text>

        {isDefect && (
          <TouchableOpacity onPress={() => handleStareClick(item, selectedGreenhouseObject)} style={styles.alert}>
            <Text style={styles.alertText}>
              ⚠ {item.component_type} faulty! Find out more
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{flex: 1}} collapsable={false}>
      <View style={headerStyle.titleContainer}>
        <Text style={headerStyle.title}>Technical</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Select a greenhouse:</Text>

        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedGreenhouse}
            onValueChange={(value) => setSelectedGreenhouse(value)}
            style={[styles.dropdown, Platform.OS === "ios" && styles.iosPicker]}
            itemStyle={Platform.OS === "ios" && styles.iosPickerItem}
          >
            <Picker.Item label="Select..." value="" />
            {greenhouses.map((greenhouse) => (
              <Picker.Item key={greenhouse.id} label={greenhouse.name} value={greenhouse.id} />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#555"
            style={{ marginTop: 20 }}
          />
        ) : selectedGreenhouse ? (
          <View>
            <Text style={styles.sectionTitle}>Sensors:</Text>
            {sensors.length > 0 ? (
              sensors.map((sensor) => renderBox(sensor))
            ) : (
              <Text style={styles.boxText}>
                No sensors for this greenhouse.
              </Text>
            )}

            <Text style={styles.sectionTitle}>Actuators:</Text>
            {actuators.length > 0 ? (
              actuators.map((actuator) => renderBox(actuator))
            ) : (
              <Text style={styles.boxText}>
                No actuators for this greenhouse.
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 15,
    ...Platform.select({
      ios: {
        height: 50,
        justifyContent: "center",
      },
    }),
  },
  dropdown: {
    height: 50,
    width: "100%",
  },
  iosPicker: {
    height: 50,
    marginHorizontal: 0,
  },
  iosPickerItem: {
    height: 50,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "normal",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  box: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    // CRITICAL FIX: REMOVED SHADOWS/ELEVATION
    // elevation: 2, <--- REMOVED
    // shadowColor: "#000", <--- REMOVED
    // shadowOffset: { width: 0, height: 1 }, <--- REMOVED
    // shadowOpacity: 0.2, <--- REMOVED
    // shadowRadius: 1.41, <--- REMOVED
  },
  boxTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  boxText: {
    fontSize: 14,
  },
  alert: {
    backgroundColor: "#ffcccc",
    padding: 8,
    marginTop: 8,
    borderRadius: 6,
  },
  alertText: {
    color: "#990000",
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default SensorsScreen;