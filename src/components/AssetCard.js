import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AssetCard = ({ asset, onPress }) => {
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{asset.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(asset.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(asset.status) }]}>
            {asset.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.code}>{asset.assetCode}</Text>
      
      {asset.description && (
        <Text style={styles.description} numberOfLines={2}>
          {asset.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.metaText}>{asset.category || 'Uncategorized'}</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Icon name="fiber-manual-record" size={16} color={getConditionColor(asset.conditionStatus)} />
          <Text style={styles.metaText}>{asset.conditionStatus}</Text>
        </View>
      </View>
      
      {asset.assignedTo && (
        <View style={styles.assignedTo}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.assignedText}>Assigned to: {asset.assignedTo.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  code: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  assignedTo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  assignedText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default AssetCard;