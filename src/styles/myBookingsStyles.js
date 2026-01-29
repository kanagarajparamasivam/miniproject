import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const myBookingsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderLeftWidth: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginBottom: 10,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    arrowContainer: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FB',
        padding: 10,
        borderRadius: 10,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#444',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 20,
    },
});
