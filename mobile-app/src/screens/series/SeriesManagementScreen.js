import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Modal,
  Portal,
  useTheme,
  Chip,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoadingContext } from '../../contexts/LoadingContext';
import { apiService } from '../../services/apiService';
import { theme } from '../../theme/theme';

const SeriesManagementScreen = ({ navigation }) => {
  const [seriesData, setSeriesData] = useState({
    normal: {
      current: 'NORM-20250630-0005',
      next: 'NORM-20250630-0006',
      format: 'YYYYMMDD-####',
      prefix: 'NORM',
      count: 1247,
    },
    special: {
      current: 'SPEC-20250630-0003',
      next: 'SPEC-20250630-0004',
      format: 'YYYYMMDD-####',
      prefix: 'SPEC',
      count: 89,
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetType, setResetType] = useState('');
  const [newStartNumber, setNewStartNumber] = useState('1');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);

  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { colors } = useTheme();

  useEffect(() => {
    loadSeriesData();
  }, []);

  const loadSeriesData = async () => {
    try {
      showLoading('Loading series data...');
      const response = await apiService.getSeriesData();
      if (response.success) {
        setSeriesData(response.data);
      }
    } catch (error) {
      console.error('Error loading series data:', error);
    } finally {
      hideLoading();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSeriesData();
    setRefreshing(false);
  };

  const handleGenerateSeries = async (type) => {
    try {
      showLoading('Generating series...');
      const response = await apiService.generateSeries(type);
      if (response.success) {
        Alert.alert('Success', `New ${type} series generated: ${response.series}`);
        await loadSeriesData();
      } else {
        Alert.alert('Error', response.message || 'Failed to generate series');
      }
    } catch (error) {
      console.error('Error generating series:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const handleResetSeries = async () => {
    if (!newStartNumber || parseInt(newStartNumber) < 1) {
      Alert.alert('Error', 'Please enter a valid start number');
      return;
    }

    try {
      showLoading('Resetting series...');
      const response = await apiService.resetSeries(resetType, parseInt(newStartNumber));
      if (response.success) {
        Alert.alert('Success', `${resetType} series reset successfully`);
        setResetModalVisible(false);
        setNewStartNumber('1');
        await loadSeriesData();
      } else {
        Alert.alert('Error', response.message || 'Failed to reset series');
      }
    } catch (error) {
      console.error('Error resetting series:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const showSeriesInfo = (type) => {
    setSelectedSeries({ type, data: seriesData[type] });
    setInfoModalVisible(true);
  };

  const SeriesCard = ({ type, data, color }) => (
    <Card style={styles.seriesCard}>
      <Card.Content>
        <View style={styles.seriesHeader}>
          <View style={styles.seriesTitleContainer}>
            <Icon name={type === 'normal' ? 'shopping' : 'star'} size={24} color={color} />
            <Title style={styles.seriesTitle}>
              {type === 'normal' ? 'Normal' : 'Special'} Series
            </Title>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: color }}
            style={[styles.statusChip, { borderColor: color }]}>
            Active
          </Chip>
        </View>

        <View style={styles.seriesInfo}>
          <View style={styles.seriesInfoItem}>
            <Text style={styles.seriesLabel}>Current Series</Text>
            <Text style={[styles.seriesValue, { color: color }]}>{data.current}</Text>
          </View>
          <View style={styles.seriesInfoItem}>
            <Text style={styles.seriesLabel}>Next Series</Text>
            <Text style={[styles.seriesValue, { color: color }]}>{data.next}</Text>
          </View>
          <View style={styles.seriesInfoItem}>
            <Text style={styles.seriesLabel}>Format</Text>
            <Text style={styles.seriesValue}>{data.format}</Text>
          </View>
          <View style={styles.seriesInfoItem}>
            <Text style={styles.seriesLabel}>Total Count</Text>
            <Text style={styles.seriesValue}>{data.count.toLocaleString()}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.seriesActions}>
          <Button
            mode="contained"
            onPress={() => handleGenerateSeries(type)}
            style={[styles.actionButton, { backgroundColor: color }]}
            icon="plus">
            Generate
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              setResetType(type);
              setResetModalVisible(true);
            }}
            style={[styles.actionButton, { borderColor: color }]}
            textColor={color}
            icon="refresh">
            Reset
          </Button>
          <Button
            mode="outlined"
            onPress={() => showSeriesInfo(type)}
            style={[styles.actionButton, { borderColor: color }]}
            textColor={color}
            icon="information">
            Info
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Title style={styles.headerTitle}>Series Management</Title>
              <Paragraph style={styles.headerSubtitle}>
                Manage and monitor your purchase series numbers
              </Paragraph>
            </View>
            <Icon name="numeric" size={48} color="white" />
          </View>
        </LinearGradient>

        {/* Series Cards */}
        <View style={styles.content}>
          <SeriesCard
            type="normal"
            data={seriesData.normal}
            color={colors.primary}
          />
          
          <View style={styles.spacer} />
          
          <SeriesCard
            type="special"
            data={seriesData.special}
            color={colors.warning}
          />

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Title style={styles.statsTitle}>Quick Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Today's Series</Text>
                <Text style={styles.statValue}>23</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>156</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Year</Text>
                <Text style={styles.statValue}>1,336</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Reset Modal */}
      <Portal>
        <Modal
          visible={resetModalVisible}
          onDismiss={() => setResetModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Reset Series</Title>
              <Paragraph style={styles.modalSubtitle}>
                This will reset the {resetType} series number. Are you sure?
              </Paragraph>
              
              <TextInput
                label="New Start Number"
                value={newStartNumber}
                onChangeText={setNewStartNumber}
                mode="outlined"
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setResetModalVisible(false)}
                  style={styles.modalButton}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleResetSeries}
                  style={[styles.modalButton, { backgroundColor: colors.danger }]}>
                  Reset
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Info Modal */}
      <Portal>
        <Modal
          visible={infoModalVisible}
          onDismiss={() => setInfoModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>
                {selectedSeries?.type === 'normal' ? 'Normal' : 'Special'} Series Information
              </Title>
              
              {selectedSeries && (
                <View style={styles.infoContainer}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Current Series:</Text>
                    <Text style={styles.infoValue}>{selectedSeries.data.current}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Next Series:</Text>
                    <Text style={styles.infoValue}>{selectedSeries.data.next}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Format:</Text>
                    <Text style={styles.infoValue}>{selectedSeries.data.format}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Prefix:</Text>
                    <Text style={styles.infoValue}>{selectedSeries.data.prefix}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Total Generated:</Text>
                    <Text style={styles.infoValue}>{selectedSeries.data.count.toLocaleString()}</Text>
                  </View>
                </View>
              )}
              
              <Button
                mode="contained"
                onPress={() => setInfoModalVisible(false)}
                style={styles.modalButton}>
                Close
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  seriesCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seriesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seriesTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  statusChip: {
    height: 24,
  },
  seriesInfo: {
    gap: 12,
  },
  seriesInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seriesLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  seriesValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  divider: {
    marginVertical: 16,
  },
  seriesActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  spacer: {
    height: 16,
  },
  statsSection: {
    marginTop: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default SeriesManagementScreen; 