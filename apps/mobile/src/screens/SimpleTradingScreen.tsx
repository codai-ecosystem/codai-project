/**
 * Simple Trading Screen - Mobile Trading Interface
 * Streamlined trading platform for mobile devices
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SimpleTradingScreen() {
  const [selectedTab, setSelectedTab] = useState('portfolio');

  const portfolioData = [
    { symbol: 'AAPL', shares: 50, value: 8750, change: 2.5 },
    { symbol: 'GOOGL', shares: 20, value: 5400, change: -1.2 },
    { symbol: 'MSFT', shares: 30, value: 9600, change: 1.8 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Trading Platform</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'portfolio' && styles.activeTab]}
          onPress={() => setSelectedTab('portfolio')}>
          <Text style={[styles.tabText, selectedTab === 'portfolio' && styles.activeTabText]}>
            Portfolio
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'watchlist' && styles.activeTab]}
          onPress={() => setSelectedTab('watchlist')}>
          <Text style={[styles.tabText, selectedTab === 'watchlist' && styles.activeTabText]}>
            Watchlist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'orders' && styles.activeTab]}
          onPress={() => setSelectedTab('orders')}>
          <Text style={[styles.tabText, selectedTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'portfolio' && (
          <View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Portfolio Value</Text>
              <Text style={styles.summaryValue}>{formatCurrency(23750)}</Text>
              <Text style={styles.summaryChange}>+$342.50 (+1.46%) today</Text>
            </View>

            <Text style={styles.sectionTitle}>Holdings</Text>
            {portfolioData.map((stock, index) => (
              <View key={index} style={styles.stockCard}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                  <Text style={[styles.stockChange, { color: stock.change >= 0 ? '#10B981' : '#EF4444' }]}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </Text>
                </View>
                <View style={styles.stockDetails}>
                  <Text style={styles.stockShares}>{stock.shares} shares</Text>
                  <Text style={styles.stockValue}>{formatCurrency(stock.value)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'watchlist' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📊</Text>
            <Text style={styles.emptyTitle}>Watchlist</Text>
            <Text style={styles.emptySubtitle}>Add stocks to track their performance</Text>
          </View>
        )}

        {selectedTab === 'orders' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptyTitle}>Order History</Text>
            <Text style={styles.emptySubtitle}>Your trading orders will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryChange: {
    fontSize: 14,
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  stockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  stockChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockShares: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
