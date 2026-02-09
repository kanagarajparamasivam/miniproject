import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function BoardingDroppingScreen({ route, navigation }) {
    const { bookingId, busId, source, destination, selectedSeats, fare, arrivalTime, needsLocalTaxi } = route.params;

    const [activeTab, setActiveTab] = useState('boarding'); // 'boarding' or 'dropping'
    const [boardingPoint, setBoardingPoint] = useState(null);
    const [droppingPoint, setDroppingPoint] = useState(null);

    // Mock Data for Points (Ideally this comes from API based on Route)
    const getBoardingPoints = (city) => {
        if (city.toLowerCase().includes('chennai')) {
            return [
                { id: 'bp1', name: 'CMBT Bus Stand', time: '21:00' },
                { id: 'bp2', name: 'Koyambedu Omni Bus Stand', time: '21:15' },
                { id: 'bp3', name: 'Ashok Pillar', time: '21:30' },
                { id: 'bp4', name: 'Guindy', time: '21:45' },
                { id: 'bp5', name: 'Tambaram', time: '22:00' },
                { id: 'bp6', name: 'Perungalathur', time: '22:15' }
            ];
        }
        return [{ id: 'bp_default', name: `${city} Main Bus Stand`, time: '21:00' }];
    };

    const getDroppingPoints = (city) => {
        if (city.toLowerCase().includes('coimbatore')) {
            return [
                { id: 'dp1', name: 'Coimbatore Bus Stand', time: '06:00' },
                { id: 'dp2', name: 'Gandhipuram', time: '06:15' },
                { id: 'dp3', name: 'Hopes College', time: '06:30' },
                { id: 'dp4', name: 'Omni Bus Stand', time: '06:45' },
                { id: 'dp5', name: 'Singanallur', time: '07:00' }
            ];
        }
        return [{ id: 'dp_default', name: `${city} Main Bus Stand`, time: '06:00' }];
    };

    const boardingOptions = getBoardingPoints(source);
    const droppingOptions = getDroppingPoints(destination);

    const handleBoardingSelect = (item) => {
        setBoardingPoint(item);
        // Auto-switch to dropping tab after selection (optional UX enhancement)
        setTimeout(() => setActiveTab('dropping'), 300);
    };

    const handleDroppingSelect = (item) => {
        setDroppingPoint(item);
    };

    const handleContinue = () => {
        if (!boardingPoint) {
            Alert.alert('Selection Required', 'Please select a Boarding Point');
            setActiveTab('boarding');
            return;
        }
        if (!droppingPoint) {
            Alert.alert('Selection Required', 'Please select a Dropping Point');
            setActiveTab('dropping');
            return;
        }

        navigation.navigate('PassengerInfo', {
            bookingId,
            busBookingId: bookingId,
            source,
            destination,
            busArrivalTime: arrivalTime,
            busFare: fare,
            totalFare: fare, // Initial total fare is just bus fare
            selectedSeats,
            boardingPoint,
            droppingPoint,
            needsLocalTaxi // Continue propagating the taxi choice
        });
    };

    const renderItem = ({ item, isSelected, onSelect }) => (
        <TouchableOpacity
            style={[
                styles.pointCard,
                isSelected && styles.pointCardSelected
            ]}
            onPress={() => onSelect(item)}
        >
            <View style={styles.pointInfo}>
                <Text style={[styles.pointName, isSelected && styles.pointNameSelected]}>{item.name}</Text>
                <Text style={styles.pointTime}>{item.time}</Text>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4A90E2', '#FFFFFF']} style={styles.headerGradient}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Points</Text>
                <Text style={styles.headerSubtitle}>{source} → {destination}</Text>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'boarding' && styles.activeTab]}
                    onPress={() => setActiveTab('boarding')}
                >
                    <Text style={[styles.tabText, activeTab === 'boarding' && styles.activeTabText]}>
                        Boarding Points
                    </Text>
                    {boardingPoint && <Ionicons name="checkmark-circle" size={16} color="#4A90E2" style={styles.tabCheck} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'dropping' && styles.activeTab]}
                    onPress={() => setActiveTab('dropping')}
                >
                    <Text style={[styles.tabText, activeTab === 'dropping' && styles.activeTabText]}>
                        Dropping Points
                    </Text>
                    {droppingPoint && <Ionicons name="checkmark-circle" size={16} color="#4A90E2" style={styles.tabCheck} />}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'boarding' ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="log-in-outline" size={20} color="#4A90E2" />
                            <Text style={styles.sectionTitle}>Boarding Point ({source})</Text>
                        </View>
                        <FlatList
                            data={boardingOptions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => renderItem({
                                item,
                                isSelected: boardingPoint?.id === item.id,
                                onSelect: handleBoardingSelect
                            })}
                            style={styles.list}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                ) : (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
                            <Text style={styles.sectionTitle}>Dropping Point ({destination})</Text>
                        </View>
                        <FlatList
                            data={droppingOptions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => renderItem({
                                item,
                                isSelected: droppingPoint?.id === item.id,
                                onSelect: handleDroppingSelect
                            })}
                            style={styles.list}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, (!boardingPoint || !droppingPoint) && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!boardingPoint || !droppingPoint}
                >
                    <Text style={styles.continueButtonText}>Continue to Passengers</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    backButton: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A5F',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#1E3A5F',
        opacity: 0.8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomColor: '#4A90E2',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    activeTabText: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    tabCheck: {
        marginLeft: 5,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    section: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#EBF5FF',
        padding: 10,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    list: {
        flex: 1,
    },
    pointCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 1,
    },
    pointCardSelected: {
        backgroundColor: '#EBF5FF',
        borderColor: '#4A90E2',
    },
    pointInfo: {
        flex: 1,
    },
    pointName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    pointNameSelected: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    pointTime: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#4A90E2',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4A90E2',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    continueButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
