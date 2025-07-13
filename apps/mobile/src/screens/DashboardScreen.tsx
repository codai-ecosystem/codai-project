/**
 * CODAI Dashboard Screen - Mobile-First Financial Overview
 * Comprehensive financial ecosystem dashboard optimized for mobile devices
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

interface FinancialMetrics {
  totalBalance: number;
  dailyChange: number;
  portfolioValue: number;
  tradingVolume: number;
  cryptoHoldings: number;
  bankBalance: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const DashboardScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalBalance: 125847.32,
    dailyChange: 2.34,
    portfolioValue: 89234.56,
    tradingVolume: 15678.90,
    cryptoHoldings: 23456.78,
    bankBalance: 36612.54,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');

  const quickActions: QuickAction[] = [
    {
      id: 'trade',
      title: 'Quick Trade',
      icon: 'trending-up',
      color: '#4CAF50',
      onPress: () => handleQuickAction('trade'),
    },
    {
      id: 'transfer',
      title: 'Transfer',
      icon: 'swap-horiz',
      color: '#2196F3',
      onPress: () => handleQuickAction('transfer'),
    },
    {
      id: 'deposit',
      title: 'Deposit',
      icon: 'add-circle',
      color: '#FF9800',
      onPress: () => handleQuickAction('deposit'),
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      icon: 'remove-circle',
      color: '#F44336',
      onPress: () => handleQuickAction('withdraw'),
    },
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120000, 118500, 122000, 125000, 123500, 126000, 125847],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const portfolioData = [
    {
      name: 'Stocks',
      population: 45,
      color: '#667eea',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Crypto',
      population: 25,
      color: '#764ba2',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Bonds',
      population: 20,
      color: '#f093fb',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Cash',
      population: 10,
      color: '#4facfe',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update metrics with fresh data
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        totalBalance: prevMetrics.totalBalance + Math.random() * 1000 - 500,
        dailyChange: (Math.random() - 0.5) * 10,
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    Alert.alert(
      'Quick Action',
      `${action} functionality will be implemented soon!`,
      [{ text: 'OK' }]
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }>
      {/* Header Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(metrics.totalBalance)}
          </Text>
          <View style={styles.changeContainer}>
            <Text style={styles.trendEmoji}>
              {metrics.dailyChange >= 0 ? '📈' : '📉'}
            </Text>
            <Text style={styles.changeText}>
              {formatPercentage(metrics.dailyChange)} today
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { borderColor: action.color }]}
              onPress={action.onPress}>
              <Text style={[styles.quickActionEmoji, { color: action.color }]}>
                {action.icon === 'send' ? '💸' :
                  action.icon === 'receipt' ? '🧾' :
                    action.icon === 'pie-chart' ? '📊' :
                      action.icon === 'settings' ? '⚙️' : '📱'}
              </Text>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Performance Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.periodSelector}>
            {['1D', '1W', '1M', '1Y'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#667eea',
            },
          }}
          style={styles.chart}
        />
      </View>

      {/* Portfolio Allocation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Allocation</Text>
        <PieChart
          data={portfolioData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>📊</Text>
            <Text style={styles.summaryLabel}>Portfolio</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(metrics.portfolioValue)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>📈</Text>
            <Text style={styles.summaryLabel}>Trading</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(metrics.tradingVolume)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>💰</Text>
            <Text style={styles.summaryLabel}>Crypto</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(metrics.cryptoHoldings)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>🏦</Text>
            <Text style={styles.summaryLabel}>Banking</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(metrics.bankBalance)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    opacity: 0.9,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  chart: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  trendEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default DashboardScreen;
