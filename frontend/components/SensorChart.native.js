import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Svg, Line } from 'react-native-svg';

import VictoryStackedBarChart from './VictoryStackedBarChart'; 

const screenWidth = Dimensions.get('window').width;

const SensorChart = ({ chartDetails, onDrillDown }) => {
    const [tooltip, setTooltip] = useState(null);
    const isPanGesture = useRef(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const updateTooltip = (rawTouchX) => {
        if (!isMounted.current) return;

        const { dataPoints, outsideDataPoints, labels } = chartDetails;
        if (!dataPoints || dataPoints.length === 0) return;

        const chartWidth = screenWidth - 20;
        const chartHeight = 220;
        const chartPaddingLeft = 62;
        const chartPaddingRight = 10;
        const plotWidth = chartWidth - chartPaddingLeft - chartPaddingRight;

        const allValues = [...dataPoints, ...(outsideDataPoints || []).filter(v => v !== null)].filter(v => v !== null);
        if (allValues.length === 0) return;
        
        const dataMin = Math.min(...allValues);
        const dataMax = Math.max(...allValues);
        let range = dataMax - dataMin;
        
        if (range === 0) range = 1; 
        
        const yAxisMin = dataMin - range * 0.1;
        const yAxisMax = dataMax + range * 0.1;

        const clampedTouchX = Math.max(chartPaddingLeft, Math.min(rawTouchX, chartPaddingLeft + plotWidth));
        let dataIndex = Math.round(((clampedTouchX - chartPaddingLeft) / plotWidth) * (dataPoints.length - 1));
        dataIndex = Math.max(0, Math.min(dataPoints.length - 1, dataIndex));

        const point = dataPoints[dataIndex];
        
        if (point === null || typeof point === 'undefined') {
            setTooltip(null); 
            return;
        }

        const dotX = chartPaddingLeft + (dataIndex / (dataPoints.length - 1)) * plotWidth;
        
        let dotY = 0;
        if (yAxisMax === yAxisMin) {
            dotY = chartHeight / 2; 
        } else {
            dotY = chartHeight * (1 - (point - yAxisMin) / (yAxisMax - yAxisMin)) + 15;
        }

        if(!isFinite(dotY)) return; 

        setTooltip({
            x: dotX,
            y: dotY,
            value: point.toFixed(1),
            label: labels[dataIndex] || '',
            outsideValue: outsideDataPoints ? (outsideDataPoints[dataIndex] !== null ? outsideDataPoints[dataIndex].toFixed(1) : null) : null,
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Changed to true to capture taps better
            onMoveShouldSetPanResponder: (_, gestureState) => {
                if (chartDetails.type !== 'line') return false;
                const { dx, dy } = gestureState;
                return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5;
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderTerminate: () => {
                isPanGesture.current = false;
                if(isMounted.current) setTooltip(null);
            },
            onPanResponderGrant: (evt, gestureState) => {
                isPanGesture.current = false;
                if (chartDetails && chartDetails.type === 'line') {
                    updateTooltip(gestureState.x0);
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                isPanGesture.current = true;
                if (chartDetails && chartDetails.type === 'line') {
                    updateTooltip(gestureState.moveX);
                }
            },
            onPanResponderRelease: () => {
                // Optional: Keep tooltip visible for a moment or clear it
                if (isMounted.current) {
                    // setTooltip(null); // Uncomment if you want it to disappear on release
                }
            },
        })
    ).current;

    const ChartContent = useMemo(() => {
        const { type, title, labels, dataPoints, outsideDataPoints, sensorUnit, optimalValueMin, optimalValueMax } = chartDetails;

        if (type === 'bar') {
            return (
                <View style={styles.chartCard}>
                    <VictoryStackedBarChart chartDetails={chartDetails} onDrillDown={onDrillDown} />
                </View>
            );
        }

        if (type === 'line') {
            if (!dataPoints || dataPoints.length < 2) {
                return (
                    <View style={[styles.chartCard, styles.container, {height: 250, justifyContent: 'center'}]}>
                        <Text style={{textAlign: 'center', color: '#666'}}>
                            Not enough data for the chart.
                        </Text>
                    </View>
                );
            }

            const chartConfig = {
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '4' },
            };

            const allValues = [...dataPoints, ...(outsideDataPoints || []).filter(v => v !== null)].filter(v => v !== null);
            
            let dataMin = 0; 
            let dataMax = 100;
            if (allValues.length > 0) {
                 dataMin = Math.min(...allValues);
                 dataMax = Math.max(...allValues);
            }

            let range = dataMax - dataMin;
            if (range === 0) range = 1; 
            
            const yAxisMin = dataMin - (range * 0.1);
            const yAxisMax = dataMax + (range * 0.1);

            const effectiveOptimalMin = Math.max(parseFloat(optimalValueMin), dataMin);
            const effectiveOptimalMax = Math.min(parseFloat(optimalValueMax), dataMax);

            const chartWidth = screenWidth - 20;
            const chartHeight = 220;
            const chartPaddingLeft = 62; 
            const chartPaddingRight = 10; 
            const plotWidth = chartWidth - chartPaddingLeft - chartPaddingRight;

            const getXLabels = () => {
                if (!labels || labels.length === 0) return [];
                const step = Math.max(1, Math.ceil(labels.length / 8));
                return labels.filter((_, i) => i % step === 0);
            };

            const data = {
                labels: getXLabels(),
                datasets: [
                    { data: outsideDataPoints || [], color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, strokeWidth: 2 },
                    { data: dataPoints, color: (opacity = 1) => `rgba(175, 214, 177, ${opacity})`, strokeWidth: 2 },
                ],
            };

            // Calculate Optimal Lines Positions
            const maxLineTop = chartHeight * (1 - (effectiveOptimalMax - yAxisMin) / (yAxisMax - yAxisMin));
            const minLineTop = chartHeight * (1 - (effectiveOptimalMin - yAxisMin) / (yAxisMax - yAxisMin));
            const showOptimal = minLineTop > maxLineTop;

            return (
                <View
                    style={[styles.chartCard, styles.container]}
                    collapsable={false} // <--- ADD THIS LINE
                >
                    <Text style={styles.title}>{title}</Text>
                    
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}><View style={[styles.legendSymbol, { backgroundColor: 'rgba(175, 214, 177, 1)', borderRadius: 5 }]} /><Text style={styles.legendText}>{`Sensor (${sensorUnit})`}</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendSymbol, { backgroundColor: 'rgba(54, 162, 235, 1)', borderRadius: 5 }]} /><Text style={styles.legendText}>{`Weather (${sensorUnit})`}</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendSymbol, { borderWidth: 1, borderColor: 'rgba(255, 204, 0, 0.9)' }]} /><Text style={styles.legendText}>Optimal</Text></View>
                    </View>

                    {/* Chart Container */}
                    <View>
                        <LineChart
                            data={data}
                            width={screenWidth - 20}
                            height={250}
                            yAxisSuffix={sensorUnit}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chartStyle}
                            yAxisMin={yAxisMin}
                            yAxisMax={yAxisMax}
                            withShadow={false}
                            withInnerLines={true}
                            // Only render static lines here
                            decorator={() => {
                                if (isNaN(yAxisMin) || isNaN(yAxisMax) || yAxisMax === yAxisMin || !showOptimal) return null;
                                return (
                                    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
                                        <View style={{ position: 'absolute', left: chartPaddingLeft, top: maxLineTop, width: plotWidth, height: minLineTop - maxLineTop, backgroundColor: 'rgba(255, 204, 0, 0.15)' }} />
                                        <View style={[styles.optimalLine, { top: maxLineTop, left: chartPaddingLeft, width: plotWidth }]} />
                                        <View style={[styles.optimalLine, { top: minLineTop, left: chartPaddingLeft, width: plotWidth }]} />
                                    </View>
                                );
                            }}
                        />

                        {/* CRITICAL FIX: Render Cursor Line OUTSIDE of LineChart but absolutely positioned over it.
                            This decoupling prevents the chart's re-renders from crashing the SVG if it's unmounted quickly. */}
                        {tooltip && (
                            <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
                                <Svg height="250" width={screenWidth - 20} style={{ position: 'absolute', top: 0, left: 0 }}>
                                    <Line 
                                        x1={tooltip.x} 
                                        y1="0" 
                                        x2={tooltip.x} 
                                        y2="204" 
                                        stroke="grey" 
                                        strokeWidth="1" 
                                        strokeDasharray="3, 3" 
                                    />
                                </Svg>
                            </View>
                        )}

                        <View style={styles.gestureCaptureView} {...panResponder.panHandlers} />
                    </View>
                    
                    {tooltip && (
                        <View style={[styles.tooltipContainer, { left: tooltip.x > screenWidth / 2 ? tooltip.x - 130 : tooltip.x + 10, top: 20 }]}>
                            <Text style={styles.tooltipLabel}>{tooltip.label}</Text>
                            <View style={styles.tooltipValueContainer}>
                                <View style={[styles.tooltipColorBox, { backgroundColor: 'rgba(175, 214, 177, 1)' }]} />
                                <Text style={styles.tooltipValue}>{tooltip.value}{sensorUnit}</Text>
                            </View>
                            {tooltip.outsideValue && (
                                <View style={styles.tooltipValueContainer}>
                                    <View style={[styles.tooltipColorBox, { backgroundColor: 'rgba(54, 162, 235, 1)' }]} />
                                    <Text style={styles.tooltipValue}>{tooltip.outsideValue}{sensorUnit}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            );
        }
        return null;
    }, [chartDetails, onDrillDown, tooltip]); // tooltip is in dependency array to update position

    return ChartContent;
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', position: 'relative' },
    title: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    chartStyle: { marginVertical: 8 },
    gestureCaptureView: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        // backgroundColor: 'transparent' // transparent background might intercept touches
    },
    optimalLine: {
        position: 'absolute',
        height: 1,
        borderWidth: 1,
        borderColor: 'rgba(255, 204, 0, 0.7)',
        borderStyle: 'dashed',
    },
    tooltipContainer: {
        position: 'absolute',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 6,
        padding: 8,
        width: 120,
    },
    tooltipLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tooltipValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    tooltipColorBox: {
        width: 10,
        height: 10,
        marginRight: 6,
        borderRadius: 2,
    },
    tooltipValue: {
        color: 'white',
        fontSize: 12,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 5,
        marginTop: 5,
        paddingHorizontal: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 5,
    },
    legendSymbol: {
        width: 10,
        height: 10,
        marginRight: 6,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
    },
    chartCard: {
        marginTop: 7,
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        overflow: 'hidden',
    },
});

export default React.memo(SensorChart);