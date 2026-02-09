import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    successIconContainer: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    fareLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    fareValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    homeButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    homeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        marginTop: 15,
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: '#4A90E2',
        fontSize: 16,
        fontWeight: '600',
    },
    // Hybrid/Taxi Section Styles
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 10,
        marginTop: 5,
    },
    taxiRow: {
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#4A90E2',
    },
    subValue: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
        fontWeight: '500',
    },
});
