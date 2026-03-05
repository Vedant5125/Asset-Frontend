import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    available: 0,
    assigned: 0,
    maintenance: 0
  });
  const [recentAssets, setRecentAssets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, assetsRes, transactionsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/assets?limit=5'),
        api.get('/transactions?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentAssets(assetsRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="account-circle" size={40} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Total Assets" value={stats.totalAssets} icon="inventory" color="#2563eb" />
        <StatCard title="Available" value={stats.available} icon="check-circle" color="#10b981" />
        <StatCard title="Assigned" value={stats.assigned} icon="person" color="#8b5cf6" />
        <StatCard title="Maintenance" value={stats.maintenance} icon="build" color="#f59e0b" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Assets', { screen: 'AddAsset' })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2563eb20' }]}>
              <Icon name="add" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionText}>Add Asset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Scanner')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Icon name="qr-code-scanner" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Assets')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
              <Icon name="inventory" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>All Assets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Icon name="person" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Assets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Assets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Assets')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentAssets.length > 0 ? (
          recentAssets.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              onPress={() => navigation.navigate('AssetDetail', { assetId: asset._id })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="inventory" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        )}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction._id}
              style={styles.transactionItem}
              onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction._id })}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionAsset}>{transaction.asset?.name}</Text>
                <Text style={styles.transactionUser}>Issued to: {transaction.user?.name}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.issueDate).toLocaleDateString()}
                </Text>
              </View>
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
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAsset: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionUser: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default DashboardScreen;