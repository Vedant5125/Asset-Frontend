import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRCode from 'react-native-qrcode-svg';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const AssetDetailScreen = ({ route, navigation }) => {
  const { assetId } = route.params;
  const [asset, setAsset] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    fetchAssetDetails();
  }, []);

  const fetchAssetDetails = async () => {
    try {
      const [assetRes, transactionsRes] = await Promise.all([
        api.get(`/assets/${assetId}`),
        api.get(`/transactions/asset/${assetId}`)
      ]);
      setAsset(assetRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load asset details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/assets/${assetId}`, { status: newStatus });
      setAsset({ ...asset, status: newStatus });
      Alert.alert('Success', `Asset status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update asset status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Asset',
      'Are you sure you want to delete this asset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/assets/${assetId}`);
              Alert.alert('Success', 'Asset deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete asset');
            }
          }
        }
      ]
    );
  };

  const shareQRCode = () => {
    // Implement QR code sharing
    Alert.alert('Share', 'Sharing feature coming soon!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'assigned': return '#3b82f6';
      case 'maintenance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'new': return '#10b981';
      case 'good': return '#3b82f6';
      case 'damaged': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with QR Code */}
      <View style={styles.header}>
        <View style={styles.qrContainer}>
          <QRCode
            value={asset.assetCode}
            size={80}
            color="#2563eb"
            backgroundColor="#fff"
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Icon name="qr-code" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setActionModalVisible(true)}
          >
            <Icon name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Asset Info */}
      <View style={styles.section}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetCode}>Code: {asset.assetCode}</Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(asset.status) + '20' }]}>
            <View style={[styles.dot, { backgroundColor: getStatusColor(asset.status) }]} />
            <Text style={[styles.badgeText, { color: getStatusColor(asset.status) }]}>
              {asset.status}
            </Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: getConditionColor(asset.conditionStatus) + '20' }]}>
            <View style={[styles.dot, { backgroundColor: getConditionColor(asset.conditionStatus) }]} />
            <Text style={[styles.badgeText, { color: getConditionColor(asset.conditionStatus) }]}>
              {asset.conditionStatus}
            </Text>
          </View>
        </View>

        {asset.description && (
          <View style={styles.infoRow}>
            <Icon name="description" size={20} color="#666" />
            <Text style={styles.infoText}>{asset.description}</Text>
          </View>
        )}

        {asset.category && (
          <View style={styles.infoRow}>
            <Icon name="category" size={20} color="#666" />
            <Text style={styles.infoText}>Category: {asset.category}</Text>
          </View>
        )}

        {asset.purchaseDate && (
          <View style={styles.infoRow}>
            <Icon name="date-range" size={20} color="#666" />
            <Text style={styles.infoText}>Purchased: {formatDate(asset.purchaseDate)}</Text>
          </View>
        )}

        {asset.assignedTo && (
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#666" />
            <Text style={styles.infoText}>
              Assigned to: {asset.assignedTo.name} ({asset.assignedTo.email})
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleStatusChange('available')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Icon name="check-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionLabel}>Mark Available</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleStatusChange('maintenance')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Icon name="build" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionLabel}>Maintenance</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('AssignAsset', { assetId: asset._id })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
              <Icon name="assignment-ind" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.actionLabel}>Assign</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('EditAsset', { asset })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2563eb20' }]}>
              <Icon name="edit" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionUser}>{transaction.user?.name}</Text>
                <View style={[
                  styles.transactionStatus,
                  { backgroundColor: transaction.status === 'issued' ? '#10b98120' : '#6b728020' }
                ]}>
                  <Text style={[
                    styles.transactionStatusText,
                    { color: transaction.status === 'issued' ? '#10b981' : '#6b7280' }
                  ]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionDate}>
                Issued: {formatDate(transaction.issueDate)}
              </Text>
              {transaction.returnDate && (
                <Text style={styles.transactionDate}>
                  Returned: {formatDate(transaction.returnDate)}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No transaction history</Text>
        )}
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>{asset.name}</Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={asset.assetCode}
                size={200}
                color="#2563eb"
                backgroundColor="#fff"
              />
            </View>
            <Text style={styles.qrCodeText}>{asset.assetCode}</Text>
            
            <View style={styles.qrModalActions}>
              <TouchableOpacity 
                style={styles.qrModalButton}
                onPress={shareQRCode}
              >
                <Icon name="share" size={24} color="#2563eb" />
                <Text style={styles.qrModalButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.qrModalButton}
                onPress={() => setQrModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
                <Text style={styles.qrModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionModalContent}>
            <TouchableOpacity 
              style={styles.actionModalItem}
              onPress={() => {
                setActionModalVisible(false);
                navigation.navigate('EditAsset', { asset });
              }}
            >
              <Icon name="edit" size={24} color="#2563eb" />
              <Text style={styles.actionModalText}>Edit Asset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionModalItem}
              onPress={() => {
                setActionModalVisible(false);
                handleDelete();
              }}
            >
              <Icon name="delete" size={24} color="#ef4444" />
              <Text style={[styles.actionModalText, { color: '#ef4444' }]}>Delete Asset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionModalCancel}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={styles.actionModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  assetName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  assetCode: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '23%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transactionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  qrModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  qrModalButton: {
    alignItems: 'center',
    padding: 10,
  },
  qrModalButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  actionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionModalText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  actionModalCancel: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  actionModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default AssetDetailScreen;