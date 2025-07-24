import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Paragraph,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../services/apiService';
import { theme } from '../../theme/theme';

const RedeemPointsScreen = ({ navigation, route }) => {
  const { customer, availablePoints } = route.params;
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const [quickRedeemAmounts, setQuickRedeemAmounts] = useState([]);

  useEffect(() => {
    const fetchQuickRedeemAmounts = async () => {
      try {
        const response = await api.get('/api/method/e_mart.api.get_quick_redeem_amounts');
        if (response.data.success && Array.isArray(response.data.data.amounts)) {
          const validAmounts = response.data.data.amounts.filter(amount => typeof amount === 'number' && amount > 0);
          setQuickRedeemAmounts(validAmounts);
        } else {
          console.warn('Invalid or missing quick redeem amounts from API');
          setQuickRedeemAmounts([10, 50, 100, 250, 500]); // Fallback values
        }
      } catch (error) {
        console.error('Error fetching quick redeem amounts:', error);
        setQuickRedeemAmounts([10, 50, 100, 250, 500]); // Fallback values
      }
    };

    fetchQuickRedeemAmounts();
  }, []);
  const handleRedeem = async () => {
    const points = parseFloat(pointsToRedeem);
    
    if (!points || points <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number of points to redeem');
      return;
    }

    if (points > availablePoints) {
      Alert.alert('Insufficient Points', `You only have ${availablePoints} points available`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/method/e_mart.api.redeem_loyalty_points', {
        customer,
        points_to_redeem: points,
        remarks: remarks || `Redeemed ${points} points via mobile app`
      });

      if (response.data.success) {
        Alert.alert(
          'Success!', 
          response.data.data.message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      Alert.alert('Error', 'Failed to redeem points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickAmount = (amount) => {
    if (amount <= availablePoints) {
      setPointsToRedeem(amount.toString());
    } else {
      Alert.alert('Insufficient Points', `You only have ${availablePoints} points available`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Icon name="gift-outline" size={32} color={theme.colors.primary} />
            <Title style={styles.title}>Redeem Loyalty Points</Title>
          </View>
          
          <Paragraph style={styles.subtitle}>
            You have {availablePoints?.toFixed(1)} points available for redemption
          </Paragraph>

          <View style={styles.inputSection}>
            <TextInput
              label="Points to Redeem"
              value={pointsToRedeem}
              onChangeText={setPointsToRedeem}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="pts" />}
            />

            <Text style={styles.quickSelectLabel}>Quick Select:</Text>
            <View style={styles.quickSelectContainer}>
              {quickRedeemAmounts.map((amount) => (
                <Chip
                  key={amount}
                  mode="outlined"
                  onPress={() => setQuickAmount(amount)}
                  style={[
                    styles.quickChip,
                    amount > availablePoints && styles.disabledChip
                  ]}
                  textStyle={amount > availablePoints && styles.disabledChipText}
                  disabled={amount > availablePoints}
                >
                  {amount}
                </Chip>
              ))}
            </View>

            <TextInput
              label="Remarks (Optional)"
              value={remarks}
              onChangeText={setRemarks}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.remarksInput}
            />
          </View>

          <View style={styles.redemptionInfo}>
            <Text style={styles.infoTitle}>Redemption Information:</Text>
            <Text style={styles.infoText}>
              • Points will be deducted immediately
            </Text>
            <Text style={styles.infoText}>
              • Redemption cannot be reversed
            </Text>
            <Text style={styles.infoText}>
              • Contact support for assistance
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleRedeem}
              loading={loading}
              disabled={loading || !pointsToRedeem || parseFloat(pointsToRedeem) <= 0}
              style={styles.redeemButton}
            >
              Redeem Points
            </Button>
          </View>
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
  card: {
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  quickSelectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  quickChip: {
    margin: 4,
  },
  disabledChip: {
    opacity: 0.5,
  },
  disabledChipText: {
    color: '#9CA3AF',
  },
  remarksInput: {
    marginTop: 8,
  },
  redemptionInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  redeemButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default RedeemPointsScreen;