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
  FAB,
  useTheme,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LoadingContext } from '../../contexts/LoadingContext';
import { apiService } from '../../services/apiService';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSales: 0,
      totalPurchases: 0,
      totalInvoices: 0,
      totalItems: 0,
    },
    recentActivity: [],
    charts: {
      salesData: [],
      purchaseData: [],
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { colors, spacing } = useTheme();

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      showLoading('Loading dashboard...');
      const response = await apiService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      hideLoading();
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), loadNotifications()]);
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newPurchase':
        navigation.navigate('PurchaseInvoice');
        break;
      case 'newSales':
        navigation.navigate('SalesInvoice');
        break;
      case 'scanQR':
        navigation.navigate('ScanQR');
        break;
      case 'camera':
        navigation.navigate('Camera');
        break;
      default:
        break;
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCardContainer}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statCardContent}>
          <View style={styles.statIconContainer}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Title style={styles.statValue}>{value}</Title>
            <Paragraph style={styles.statTitle}>{title}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionContainer}>
      <Card style={styles.quickActionCard}>
        <Card.Content style={styles.quickActionContent}>
          <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
            <Icon name={icon} size={24} color="white" />
          </View>
          <View style={styles.quickActionText}>
            <Title style={styles.quickActionTitle}>{title}</Title>
            <Paragraph style={styles.quickActionSubtitle}>{subtitle}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}>
              <Icon name="bell" size={24} color="white" />
              {notifications.length > 0 && (
                <Badge style={styles.notificationBadge}>
                  {notifications.length}
                </Badge>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Sales"
            value={`$${dashboardData.stats.totalSales.toLocaleString()}`}
            icon="currency-usd"
            color={colors.success}
            onPress={() => navigation.navigate('Reports')}
          />
          <StatCard
            title="Total Purchases"
            value={`$${dashboardData.stats.totalPurchases.toLocaleString()}`}
            icon="shopping"
            color={colors.primary}
            onPress={() => navigation.navigate('Reports')}
          />
          <StatCard
            title="Invoices"
            value={dashboardData.stats.totalInvoices}
            icon="file-document"
            color={colors.info}
            onPress={() => navigation.navigate('Reports')}
          />
          <StatCard
            title="Items"
            value={dashboardData.stats.totalItems}
            icon="package-variant"
            color={colors.warning}
            onPress={() => navigation.navigate('Inventory')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="New Purchase"
              subtitle="Create purchase invoice"
              icon="plus-circle"
              color={colors.primary}
              onPress={() => handleQuickAction('newPurchase')}
            />
            <QuickActionCard
              title="New Sales"
              subtitle="Create sales invoice"
              icon="plus-circle"
              color={colors.success}
              onPress={() => handleQuickAction('newSales')}
            />
            <QuickActionCard
              title="Scan QR"
              subtitle="Scan barcode/QR code"
              icon="qrcode-scan"
              color={colors.info}
              onPress={() => handleQuickAction('scanQR')}
            />
            <QuickActionCard
              title="Camera"
              subtitle="Take photo"
              icon="camera"
              color={colors.warning}
              onPress={() => handleQuickAction('camera')}
            />
          </View>
        </View>

        {/* Sales Chart */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Sales Overview</Title>
          <Card style={styles.chartCard}>
            <Card.Content>
              <LineChart
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      data: dashboardData.charts.salesData.length > 0
                        ? dashboardData.charts.salesData
                        : [20, 45, 28, 80, 99, 43],
                    },
                  ],
                }}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Reports')}>
              View All
            </Button>
          </View>
          <Card style={styles.activityCard}>
            <Card.Content>
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Icon
                        name={activity.icon}
                        size={20}
                        color={activity.color}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activitySubtitle}>
                        {activity.subtitle}
                      </Text>
                    </View>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="information" size={48} color={colors.disabled} />
                  <Text style={styles.emptyStateText}>No recent activity</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Series Management Quick Access */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Series Management</Title>
          <Card style={styles.seriesCard}>
            <Card.Content>
              <View style={styles.seriesInfo}>
                <View>
                  <Text style={styles.seriesLabel}>Current Normal Series</Text>
                  <Text style={styles.seriesValue}>NORM-20250630-0005</Text>
                </View>
                <View>
                  <Text style={styles.seriesLabel}>Current Special Series</Text>
                  <Text style={styles.seriesValue}>SPEC-20250630-0003</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('SeriesManagement')}
                style={styles.seriesButton}>
                Manage Series
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          Alert.alert(
            'Quick Action',
            'Choose an action',
            [
              {
                text: 'New Purchase',
                onPress: () => handleQuickAction('newPurchase'),
              },
              {
                text: 'New Sales',
                onPress: () => handleQuickAction('newSales'),
              },
              {
                text: 'Scan QR',
                onPress: () => handleQuickAction('scanQR'),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        }}
      />
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
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCardContainer: {
    flex: 1,
    minWidth: '45%',
  },
  statCard: {
    borderRadius: 12,
    elevation: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionContainer: {
    flex: 1,
    minWidth: '45%',
  },
  quickActionCard: {
    borderRadius: 12,
    elevation: 2,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chartCard: {
    borderRadius: 12,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityCard: {
    borderRadius: 12,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  seriesCard: {
    borderRadius: 12,
    elevation: 2,
  },
  seriesInfo: {
    marginBottom: 16,
  },
  seriesLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  seriesValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  seriesButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default DashboardScreen; 