import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import headerStyle from "../components/GlobalStyles/headerStyle";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  InteractionManager, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  getGreenhouses,
  getSensorsByGreenhouse,
  getReadingsBySensor,
  getOutsideWeatherByGreenhouse,
} from "../services/apiClient.js";
import SensorChart from "../components/SensorChart.native.js";
import {
  subHours,
  subDays,
  format,
  parseISO,
  startOfToday,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

const screenWidth = Dimensions.get("window").width;

const StatisticsScreen = () => {
  const isFocused = useIsFocused(); // <--- CRITICAL IMPORT
  const [greenhouses, setGreenhouses] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [outsideWeather, setOutsideWeather] = useState([]);
  
  const [selectedGreenhouse, setSelectedGreenhouse] = useState("");
  const [selectedSensorType, setSelectedSensorType] = useState("temperature");
  const [selectedSensorId, setSelectedSensorId] = useState("");
  
  const [timeRange, setTimeRange] = useState("24h");
  const [optimalValueMin, setOptimalValueMin] = useState("25");
  const [optimalValueMax, setOptimalValueMax] = useState("35");
  
  const [loading, setLoading] = useState(false);
  
  // Controls the "Lazy Load"
  const [interactionsComplete, setInteractionsComplete] = useState(false);

  const [drillDownDate, setDrillDownDate] = useState(null);
  const [previousTimeRange, setPreviousTimeRange] = useState(null);

  const isMounted = useRef(true);

  // --- LIFECYCLE SAFEGUARDS ---
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        if (isMounted.current) {
          setInteractionsComplete(true);
        }
      });

      return () => {
        task.cancel();
        // We do NOT setInteractionsComplete(false) here to avoid flickering on simple tab switches,
        // but we rely on `isFocused` below to kill the chart during transition.
      };
    }, [])
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- 1. FETCH GREENHOUSES ---
  useEffect(() => {
    getGreenhouses()
      .then((response) => {
        if (isMounted.current) {
          setGreenhouses(response.data);
          if (response.data.length > 0) {
            setSelectedGreenhouse(response.data[0].id);
          }
        }
      })
      .catch((error) => console.error("Error fetching greenhouses:", error));
  }, []);

  // --- 2. FETCH SENSORS & WEATHER ---
  useEffect(() => {
    if (!selectedGreenhouse) return;

    const task = InteractionManager.runAfterInteractions(() => {
        setLoading(true);
        const fetchData = async () => {
          try {
            const [sensorsRes, weatherRes] = await Promise.all([
              getSensorsByGreenhouse(selectedGreenhouse),
              getOutsideWeatherByGreenhouse(selectedGreenhouse),
            ]);

            if (!isMounted.current) return;

            const fetchedSensors = sensorsRes.data || [];
            setSensors(fetchedSensors);

            const currentTypeSensor =
              fetchedSensors.find((s) => s.type === selectedSensorType) ||
              fetchedSensors[0];

            if (currentTypeSensor) {
              if (selectedSensorId !== currentTypeSensor.id) {
                setSelectedSensorId(currentTypeSensor.id);
              }
            } else {
              setSelectedSensorId("");
              setSensorReadings([]);
            }

            setOutsideWeather(weatherRes.data || []);

          } catch (error) {
              console.error("Error fetching greenhouse data:", error);
              if (isMounted.current) {
                setSensors([]);
                setOutsideWeather([]);
              }
          } finally {
             if(isMounted.current) setLoading(false);
          }
        };
        fetchData();
    });

    return () => task.cancel();
  }, [selectedGreenhouse, selectedSensorType]);

  // --- 3. FETCH READINGS ---
  useEffect(() => {
    if (!selectedSensorId) {
      setSensorReadings([]);
      return;
    }

    setSensorReadings([]); 
    
    const task = InteractionManager.runAfterInteractions(() => {
        setLoading(true);
        getReadingsBySensor(selectedSensorId)
          .then((response) => {
            if (isMounted.current) {
              setSensorReadings(response.data);
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error fetching sensor readings:", error);
            if (isMounted.current) {
                setSensorReadings([]);
                setLoading(false);
            }
          });
    });

    return () => task.cancel();
  }, [selectedSensorId, timeRange]);
  
  // --- HELPERS ---
  const uniqueSensorTypes = useMemo(() => {
    const types = sensors.map((s) => s.type);
    return [...new Set(types)];
  }, [sensors]);

  const sensorsForDropdown = useMemo(() => {
    return sensors.filter((s) => s.type === selectedSensorType);
  }, [sensors, selectedSensorType]);

  const handleSensorTypeChange = (newType) => {
    setSelectedSensorType(newType);
    const firstSensorOfType = sensors.find((s) => s.type === newType);
    setSelectedSensorId(firstSensorOfType ? firstSensorOfType.id : "");
  };

  const handleDrillDown = useCallback(
    (date) => {
      setPreviousTimeRange(timeRange);
      setDrillDownDate(date);
    },
    [timeRange]
  );

  const handleGoBack = () => {
    setTimeRange(previousTimeRange || "24h");
    setDrillDownDate(null);
    setPreviousTimeRange(null);
  };

  // --- CHART DATA PROCESSING ---
  // Only calculate heavy data if we are actually going to render
  const shouldRenderChart = interactionsComplete && isFocused && !loading;

  const chartDetails = useMemo(() => {
    if (!shouldRenderChart || !selectedSensorId || !sensorReadings || sensorReadings.length === 0) return null;

    const currentSensor = sensors.find((s) => s.id === selectedSensorId);
    if (!currentSensor) return null;

    const sensorUnit = currentSensor.unit || "";
    const now = new Date();
    const oMin = parseFloat(optimalValueMin) || 0; 
    const oMax = parseFloat(optimalValueMax) || 100;

    const validWeatherTypes = ["temperature", "humidity"];

    if (drillDownDate) {
      const dayStart = startOfDay(parseISO(drillDownDate));
      const dayEnd = endOfDay(parseISO(drillDownDate));

      const filterForDay = (readings) =>
        readings
          .map((d) => ({ ...d, timestamp: parseISO(d.timestamp) }))
          .filter((d) =>
            isWithinInterval(d.timestamp, { start: dayStart, end: dayEnd })
          )
          .sort((a, b) => a.timestamp - b.timestamp);

      const todaysSensorReadings = filterForDay(sensorReadings);
      const todaysOutsideWeather = filterForDay(outsideWeather);

      if (todaysSensorReadings.length === 0) return null;

      let outsideDataPoints = [];
      if (
        validWeatherTypes.includes(selectedSensorType) &&
        todaysOutsideWeather.length > 0
      ) {
        outsideDataPoints = todaysSensorReadings.map((sensorReading) => {
          const closestOutside = todaysOutsideWeather.reduce((prev, curr) => {
            return Math.abs(curr.timestamp - sensorReading.timestamp) <
              Math.abs(prev.timestamp - sensorReading.timestamp)
              ? curr
              : prev;
          }, todaysOutsideWeather[0]);

          return Math.abs(closestOutside.timestamp - sensorReading.timestamp) <
            30 * 60 * 1000
            ? closestOutside[selectedSensorType]
            : null;
        });
      }

      return {
        type: "line",
        title: `Readings from ${format(dayStart, "d MMM yyyy")}`,
        labels: todaysSensorReadings.map((r) => format(r.timestamp, "HH:mm")),
        dataPoints: todaysSensorReadings.map((r) => r.value),
        outsideDataPoints,
        optimalValueMin: oMin,
        optimalValueMax: oMax,
        sensorUnit,
        rawValues: todaysSensorReadings.map((r) => r.value),
        showOutsideWeather: validWeatherTypes.includes(selectedSensorType),
      };
    }

    if (timeRange === "24h") {
      const twentyFourHoursAgo = subHours(now, 24);
      
      const filteredReadings = sensorReadings
        .map((d) => ({ ...d, timestamp: parseISO(d.timestamp) }))
        .filter((d) => d.timestamp >= twentyFourHoursAgo && d.timestamp <= now)
        .sort((a, b) => a.timestamp - b.timestamp);

      const filteredOutsideWeather = outsideWeather
        .map((d) => ({ ...d, timestamp: parseISO(d.timestamp) }))
        .filter((d) => d.timestamp >= twentyFourHoursAgo && d.timestamp <= now)
        .sort((a, b) => a.timestamp - b.timestamp);

      if (filteredReadings.length === 0) return null;

      let outsideDataPoints = [];
      if (
        validWeatherTypes.includes(selectedSensorType) &&
        filteredOutsideWeather.length > 0
      ) {
        outsideDataPoints = filteredReadings.map((sensorReading) => {
          const closestOutside = filteredOutsideWeather.reduce(
            (prev, curr) =>
              Math.abs(curr.timestamp - sensorReading.timestamp) <
              Math.abs(prev.timestamp - sensorReading.timestamp)
                ? curr
                : prev,
            filteredOutsideWeather[0] || { timestamp: new Date(0) }
          );
          return Math.abs(closestOutside.timestamp - sensorReading.timestamp) <
            30 * 60 * 1000
            ? closestOutside[selectedSensorType]
            : null;
        });
      }

      return {
        type: "line",
        title: "Readings from the last 24 hours",
        labels: filteredReadings.map((d) => format(d.timestamp, "HH:mm")),
        dataPoints: filteredReadings.map((d) => d.value),
        outsideDataPoints,
        optimalValueMin: oMin,
        optimalValueMax: oMax,
        sensorUnit,
        rawValues: filteredReadings.map((r) => r.value),
        showOutsideWeather: validWeatherTypes.includes(selectedSensorType),
      };
    } 
    
    else {
      const days = timeRange === "7d" ? 7 : 30;
      const pastDate = subDays(startOfToday(), days - 1);

      const filteredReadings = sensorReadings
        .map((d) => ({ ...d, timestamp: parseISO(d.timestamp) }))
        .filter((d) => d.timestamp >= pastDate && d.timestamp <= now);

      if (filteredReadings.length === 0) return null;

      const dailyAggregates = {};
      filteredReadings.forEach((d) => {
        const day = format(d.timestamp, "yyyy-MM-dd");
        if (!dailyAggregates[day]) dailyAggregates[day] = [];
        dailyAggregates[day].push(d.value);
      });

      const dateLabels = Object.keys(dailyAggregates).sort();
      const displayLabels = dateLabels.map((day) =>
        format(parseISO(day), "MMM d")
      );
      const inRangePercentages = [];
      const outOfRangePercentages = [];

      dateLabels.forEach((dayKey) => {
        const dayValues = dailyAggregates[dayKey];
        const totalReadings = dayValues.length;
        const inRangeCount = dayValues.filter(
          (v) => v >= oMin && v <= oMax
        ).length;
        inRangePercentages.push((inRangeCount / totalReadings) * 100);
        outOfRangePercentages.push(
          ((totalReadings - inRangeCount) / totalReadings) * 100
        );
      });

      return {
        type: "bar",
        title: `Daily Compliance (Last ${dateLabels.length} days)`,
        dateLabels,
        displayLabels,
        datasets: {
          inRange: inRangePercentages,
          outOfRange: outOfRangePercentages,
        },
        sensorUnit,
        rawValues: filteredReadings.map((r) => r.value),
      };
    }
  }, [
    sensorReadings,
    outsideWeather,
    sensors,
    selectedSensorId,
    timeRange,
    optimalValueMin,
    optimalValueMax,
    loading,
    shouldRenderChart, // Updated dependency
    drillDownDate,
    selectedSensorType,
  ]);

  const summaryStats = useMemo(() => {
    if (
      !chartDetails ||
      !chartDetails.rawValues ||
      chartDetails.rawValues.length === 0
    ) {
      return { min: "N/A", max: "N/A", avg: "N/A", inRange: "N/A" };
    }
    const dataSet = chartDetails.rawValues.filter((v) => v !== null && !isNaN(v));
    if (dataSet.length === 0)
      return { min: "N/A", max: "N/A", avg: "N/A", inRange: "N/A" };

    const min = Math.min(...dataSet).toFixed(1);
    const max = Math.max(...dataSet).toFixed(1);
    const avg = (
      dataSet.reduce((a, b) => Number(a) + Number(b), 0) / dataSet.length
    ).toFixed(1);

    const oMin = parseFloat(optimalValueMin) || 0;
    const oMax = parseFloat(optimalValueMax) || 100;
    
    const inRangeCount = dataSet.filter(
      (val) => val >= oMin && val <= oMax
    ).length;
    
    const inRange = ((inRangeCount / dataSet.length) * 100).toFixed(0) + "%";

    return { min, max, avg, inRange };
  }, [chartDetails, optimalValueMin, optimalValueMax]);

  const isDrillDown = !!drillDownDate;

  const timeRangeDisplay =
    previousTimeRange === "7d"
      ? "7 days"
      : previousTimeRange === "30d"
      ? "30 days"
      : previousTimeRange === "24h"
      ? "24 hours"
      : previousTimeRange;

  // --- RENDER ---
  return (
    <View style={styles.safeArea}>
      <View style={headerStyle.titleContainer}>
        <Text style={headerStyle.title}>Statistics</Text>
      </View>

      <ScrollView
        style={styles.container}
        removeClippedSubviews={false}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 30 }}
      >
        {!isDrillDown && (
          <View style={styles.filtersContainer}>
            {/* ... Filters UI ... */}
            <View style={styles.row}>
              <View style={styles.filterItem}>
                <Text style={styles.label}>Greenhouse</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedGreenhouse}
                    onValueChange={(itemValue) =>
                      setSelectedGreenhouse(itemValue)
                    }
                    enabled={greenhouses.length > 0}
                    style={[
                      styles.picker,
                      Platform.OS === "ios" && styles.iosPicker,
                    ]}
                    itemStyle={Platform.OS === "ios" && styles.iosPickerItem}
                    mode="dropdown"
                  >
                    {greenhouses.map((g) => (
                      <Picker.Item key={g.id} label={g.name} value={g.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.filterItem}>
                <Text style={styles.label}>Sensor Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSensorType}
                    onValueChange={(itemValue) =>
                      handleSensorTypeChange(itemValue)
                    }
                    enabled={uniqueSensorTypes.length > 0}
                    style={[
                      styles.picker,
                      Platform.OS === "ios" && styles.iosPicker,
                    ]}
                    itemStyle={Platform.OS === "ios" && styles.iosPickerItem}
                    mode="dropdown"
                  >
                    {uniqueSensorTypes.map((type) => (
                      <Picker.Item
                        key={type}
                        label={type
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                        value={type}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.filterItem}>
                <Text style={styles.label}>Specific Sensor</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSensorId}
                    onValueChange={(itemValue) =>
                      setSelectedSensorId(itemValue)
                    }
                    enabled={sensorsForDropdown.length > 0}
                    style={[
                      styles.picker,
                      Platform.OS === "ios" && styles.iosPicker,
                    ]}
                    itemStyle={Platform.OS === "ios" && styles.iosPickerItem}
                    mode="dropdown"
                  >
                    {sensorsForDropdown.map((s) => (
                      <Picker.Item key={s.id} label={s.name} value={s.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.filterItem}>
                <View style={styles.optimalRangeContainer}>
                  <View style={{ flex: 1 }}>
                    <Text 
                      style={styles.label} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      Opt. Min
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={optimalValueMin}
                      onChangeText={setOptimalValueMin}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text 
                      style={styles.label} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      Opt. Max
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={optimalValueMax}
                      onChangeText={setOptimalValueMax}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.timeButtonsContainer}>
          {isDrillDown ? (
            <TouchableOpacity style={styles.button} onPress={handleGoBack}>
              <Text style={styles.buttonText}>
                {`← Back to ${timeRangeDisplay} view`}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  timeRange === "24h" && styles.activeButton,
                ]}
                onPress={() => setTimeRange("24h")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    timeRange === "24h" && styles.activeButtonText,
                  ]}
                >
                  24 hours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  timeRange === "7d" && styles.activeButton,
                ]}
                onPress={() => setTimeRange("7d")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    timeRange === "7d" && styles.activeButtonText,
                  ]}
                >
                  7 days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  timeRange === "30d" && styles.activeButton,
                ]}
                onPress={() => setTimeRange("30d")}
              >
                <Text
                  style={[
                    styles.buttonText,
                    timeRange === "30d" && styles.activeButtonText,
                  ]}
                >
                  30 days
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View 
          style={styles.chartContainer}
          collapsable={false} // <--- ADD THIS LINE. This prevents the ShadowNode crash.
        >
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : chartDetails && shouldRenderChart ? (
            // Only render SensorChart if interactions are done AND IS FOCUSED
            <SensorChart chartDetails={chartDetails} onDrillDown={handleDrillDown} />
          ) : (
            <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
              {!loading && (
                <Text style={styles.noDataText}>
                  {interactionsComplete ? "No data available." : "Loading..."}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Minimum</Text>
            <Text style={styles.cardValue}>
              {summaryStats.min}
              {chartDetails?.sensorUnit}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Maximum</Text>
            <Text style={styles.cardValue}>
              {summaryStats.max}
              {chartDetails?.sensorUnit}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Average</Text>
            <Text style={styles.cardValue}>
              {summaryStats.avg}
              {chartDetails?.sensorUnit}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>In Range</Text>
            <Text style={[styles.cardValue, { color: "#2e7d32" }]}>
              {summaryStats.inRange}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { paddingHorizontal: 10 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  filtersContainer: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  filterItem: { flex: 1 },
  label: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 1,
    ...Platform.select({
      ios: {
        height: 50,
        justifyContent: "center",
      },
      android: {
        height: 50,
        justifyContent: "center",
      },
    }),
  },
  picker: {
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 16,
    backgroundColor: "#fff",
    height: 50,
  },
  optimalRangeContainer: { flexDirection: "row", gap: 10 },
  timeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(175, 214, 177, 1)",
    backgroundColor: "#fff",
  },
  activeButton: {
    backgroundColor: "rgba(175, 214, 177, 1)",
    borderColor: "rgba(175, 214, 177, 1)",
  },
  buttonText: { fontSize: 14, color: "#333" },
  activeButtonText: { color: "black" },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
    minHeight: 300,
    justifyContent: "center",
  },
  noDataText: { textAlign: "center", color: "#666" },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  cardValue: { fontSize: 18, fontWeight: "600" },
});

export default StatisticsScreen;