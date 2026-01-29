import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  routeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  routeNo: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  timeInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  scrollContent: {
    flex: 1,
  },
  seatLayout: {
    padding: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  seatGrid: {
    maxHeight: 400,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  seatGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  aisle: {
    width: 40,
  },
  seat: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableSeat: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  selectedSeat: {
    backgroundColor: '#4A90E2',
    borderColor: '#1E3A5F',
  },
  bookedSeat: {
    backgroundColor: '#FFCDD2',
    borderColor: '#E74C3C',
  },
  seatDisabled: {
    opacity: 0.6,
  },
  seatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedSeatText: {
    color: '#FFFFFF',
  },
  bookedSeatText: {
    color: '#666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  footerValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  footerFare: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

