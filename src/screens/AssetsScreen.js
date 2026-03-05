import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import AssetCard from '../components/AssetCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AssetsScreen = ({ navigation }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [searchQuery, selectedFilter, selectedStatus, selectedCondition, assets]);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.category && asset.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status === selectedStatus);
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(asset => asset.conditionStatus === selectedCondition);
    }

    setFilteredAssets(filtered);
  };

  const handleDelete = (assetId) => {
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
              fetchAssets();
              Alert.alert('Success', 'Asset deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete asset');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedStatus('all');
    setSelectedCondition('all');
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon 
            name="filter-list" 
            size={24} 
            color={(selectedStatus !== 'all' || selectedCondition !== 'all') ? '#2563eb' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      {(selectedStatus !== 'all' || selectedCondition !== 'all') && (
        <View style={styles.filterChips}>
          {selectedStatus !== 'all' && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>Status: {selectedStatus}</Text>
              <TouchableOpacity onPress={() => setSelectedStatus('all')}>
                <Icon name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {selectedCondition !== 'all' && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>Condition: {selectedCondition}</Text>
              <TouchableOpacity onPress={() => setSelectedCondition('all')}>
                <Icon name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Assets List */}
      <FlatList
        data={filteredAssets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AssetCard
            asset={item}
            onPress={() => navigation.navigate('AssetDetail', { assetId: item._id })}
            onDelete={() => handleDelete(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="inventory" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Assets Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Tap the + button to add your first asset'}
            </Text>
          </View>
        }
      />

      {/* Add Asset Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddAsset')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Assets</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'available', 'assigned', 'maintenance'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      selectedStatus === status && styles.filterOptionSelected
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedStatus === status && styles.filterOptionTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Condition</Text>
              <View style={styles.filterOptions}>
                {['all', 'new', 'good', 'damaged'].map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.filterOption,
                      selectedCondition === condition && styles.filterOptionSelected
                    ]}
                    onPress={() => setSelectedCondition(condition)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedCondition === condition && styles.filterOptionTextSelected
                    ]}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  filterChips: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  chipText: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
    textTransform: 'capitalize',
  },
  clearAllText: {
    fontSize: 12,
    color: '#2563eb',
  },
  listContent: {
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#2563eb',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AssetsScreen;