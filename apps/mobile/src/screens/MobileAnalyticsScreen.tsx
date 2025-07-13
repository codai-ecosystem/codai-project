import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MobileService from '../../services/MobileService';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  deviceMetrics: {
    totalDevices: number;
    activeDevices: number;
    newDevices: number;
    platformDistribution: Record<string, number>;
  };
  usageMetrics: {
    totalSessions: number;
    avgSessionDuration: number;
    dailyActiveUsers: number;
  };
  performanceMetrics: {
    crashCount: number;
    errorCount: number;
  };
}

const MetricCard = ({
  title,
  value,
  subtitle,
  color = '#667eea'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

export default function MobileAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await MobileService.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {['1d', '7d', '30d'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.timeRangeButtonActive
          ]}
          onPress={() => setTimeRange(range as any)}
        >
          <Text style={[
            styles.timeRangeText,
            timeRange === range && styles.timeRangeTextActive
          ]}>
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mobile Analytics</Text>
          <Text style={styles.subtitle}>Comprehensive mobile experience insights</Text>
        </View>

        {renderTimeRangeSelector()}

        {analytics && (
          <View style={styles.content}>
            {/* Device Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Metrics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Total Devices"
                  value={analytics.deviceMetrics.totalDevices.toLocaleString()}
                  color="#667eea"
                />
                <MetricCard
                  title="Active Devices"
                  value={analytics.deviceMetrics.activeDevices.toLocaleString()}
                  color="#22c55e"
                />
                <MetricCard
                  title="New Devices"
                  value={analytics.deviceMetrics.newDevices.toLocaleString()}
                  color="#f59e0b"
                />
              </View>
            </View>

            {/* Usage Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usage Metrics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Total Sessions"
                  value={analytics.usageMetrics.totalSessions.toLocaleString()}
                  color="#8b5cf6"
                />
                <MetricCard
                  title="Avg Session"
                  value={`${analytics.usageMetrics.avgSessionDuration.toFixed(1)}min`}
                  color="#06b6d4"
                />
                <MetricCard
                  title="Daily Active"
                  value={analytics.usageMetrics.dailyActiveUsers.toLocaleString()}
                  color="#10b981"
                />
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Performance"
                  value="98.5%"
                  color="#10B981"
                />
                <MetricCard
                  title="Crashes"
                  value={analytics.performanceMetrics.crashCount.toString()}
                  color="#ef4444"
                />
                <MetricCard
                  title="Errors"
                  value={analytics.performanceMetrics.errorCount.toString()}
                  color="#f97316"
                />
              </View>
            </View>

            {/* Platform Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Platform Distribution</Text>
              <View style={styles.platformContainer}>
                {Object.entries(analytics.deviceMetrics.platformDistribution).map(([platform, count]) => (
                  <View key={platform} style={styles.platformItem}>
                    <Text style={styles.platformName}>{platform}</Text>
                    <Text style={styles.platformCount}>{count.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  timeRangeButtonActive: {
    backgroundColor: '#667eea',
  },
  timeRangeText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2 - 8,
    borderLeftWidth: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  platformContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  platformName: {
    fontSize: 16,
    color: '#ffffff',
  },
  platformCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
});
