import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Badge,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/apiService';
import { theme } from '../../theme/theme';

const LoyaltyPointsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const customer = route?.params?.customer || user?.customer;

  useEffect(() => {
    if (customer) {
      fetchLoyaltyData();
    }
  }, [customer]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/method/e_mart.api.get_customer_loyalty_summary`, {
        params: { customer }
      });
      
      if (response.data.success) {
        setLoyaltyData(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch loyalty data');
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      Alert.alert('Error', 'Failed to fetch loyalty points data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLoyaltyData();
  };

  const handleRedeemPoints = () => {
    if (loyaltyData?.current_points > 0) {
      navigation.navigate('RedeemPoints', { 
        customer,
        availablePoints: loyaltyData.current_points 
      });
    } else {
      Alert.alert('No Points', 'You don\'t have enough points to redeem');
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Tier 3 (Premium)':
        return '#8B5CF6';
      case 'Tier 2 (Gold)':
        return '#F59E0B';
      case 'Tier 1 (Silver)':
        return '#6B7280';
      default:
        return '#10B981';
    }
  };

  const renderTierProgress = () => {
    if (!loyaltyData?.tier_info || loyaltyData.tier_info.program_type === 'Single Tier Program') {
      return null;
    }

    const { tier_info, total_spent } = loyaltyData;
    const thresholds = tier_info.tier_thresholds;
    
    return (
      <Card style={styles.tierCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Icon name="trophy" size={20} color={theme.colors.primary} />
            {' '}Tier Progress
          </Title>
          <View style={styles.tierInfo}>
            <Chip 
              mode="outlined" 
              style={[styles.tierChip, { borderColor: getTierColor(tier_info.current_tier) }]}
              textStyle={{ color: getTierColor(tier_info.current_tier) }}
            >
              {tier_info.current_tier}
            </Chip>
            <Text style={styles.conversionText}>
              Earning {tier_info.conversion_factor}x points per rupee
            </Text>
          </View>
          
          {tier_info.current_tier !== 'Tier 3 (Premium)' && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Spent: ₹{total_spent?.toFixed(2)} 
                {tier_info.current_tier === 'Standard' && thresholds.tier_1 && 
                  ` / ₹${thresholds.tier_1} for Silver`}
                {tier_info.current_tier === 'Tier 1 (Silver)' && thresholds.tier_2 && 
                  ` / ₹${thresholds.tier_2} for Gold`}
                {tier_info.current_tier === 'Tier 2 (Gold)' && thresholds.tier_3 && 
                  ` / ₹${thresholds.tier_3} for Premium`}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading loyalty points...</Text>
      </View>
    );
  }

  if (!loyaltyData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-remove" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>No loyalty program found</Text>
        <Button mode="contained" onPress={fetchLoyaltyData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Points Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.pointsHeader}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{loyaltyData.current_points?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.pointsLabel}>Available Points</Text>
            </View>
            <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemPoints}>
              <Icon name="gift" size={24} color="white" />
              <Text style={styles.redeemButtonText}>Redeem</Text>
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{loyaltyData.total_spent?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{loyaltyData.tier_info?.program_name || 'N/A'}</Text>
              <Text style={styles.statLabel}>Program</Text>
            </View>
          </View>
          
          {loyaltyData.tier_info?.calculation_basis && (
            <View style={styles.calculationBasisContainer}>
              <Icon 
                name={loyaltyData.tier_info.calculation_basis === CALCULATION_BASIS_PROFIT ? ICON_PROFIT : ICON_REVENUE} 
                size={16} 
                color={theme.colors.secondary} 
              />
              <Text style={styles.calculationBasisText}>
                Points calculated based on {loyaltyData.tier_info.calculation_basis.toLowerCase()}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Tier Progress */}
      {renderTierProgress()}

      {/* Recent Transactions */}
      <Card style={styles.transactionsCard}>
        <Card.Content>
          <View style={styles.transactionsHeader}>
            <Title style={styles.cardTitle}>
              <Icon name="history" size={20} color={theme.colors.primary} />
              {' '}Recent Transactions
            </Title>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('LoyaltyHistory', { customer })}
            >
              View All
            </Button>
          </View>
          
          {loyaltyData.recent_transactions?.length > 0 ? (
            loyaltyData.recent_transactions.slice(0, 5).map((transaction, index) => (
              <View key={transaction.name} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Icon 
                    name={transaction.transaction_type === 'Earned' ? 'plus' : 'minus'} 
                    size={16} 
                    color={transaction.transaction_type === 'Earned' ? '#10B981' : '#EF4444'} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionType}>
                    {transaction.transaction_type} Points
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionPoints,
                  { color: transaction.transaction_type === 'Earned' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.transaction_type === 'Earned' ? '+' : ''}{transaction.loyalty_points?.toFixed(1)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noTransactions}>
              <Icon name="clipboard-text" size={48} color="#9CA3AF" />
              <Text style={styles.noTransactionsText}>No transactions yet</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 4,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  redeemButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  calculationBasisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  calculationBasisText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  tierCard: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tierChip: {
    marginRight: 12,
  },
  conversionText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  transactionsCard: {
    marginBottom: 16,
    elevation: 4,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noTransactionsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default LoyaltyPointsScreen;