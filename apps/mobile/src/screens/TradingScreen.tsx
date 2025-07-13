/**
 * Trading Screen - Mobile-First Trading Interface
 * Advanced trading platform optimized for mobile touch interactions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

const TradingScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const topStocks: Stock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 1.23, changePercent: 0.68 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 377.44, change: -2.11, changePercent: -0.56 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: 0.87, changePercent: 0.63 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 5.32, changePercent: 2.19 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 722.48, change: 12.45, changePercent: 1.75 },
  ];

  const chartData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
    datasets: [{
      data: selectedStock
        ? [selectedStock.price - 5, selectedStock.price - 2, selectedStock.price + 1, selectedStock.price - 1, selectedStock.price + 3, selectedStock.price]
        : [180, 182, 181, 183, 185, 182]
    }]
  };

  useEffect(() => {
    loadWatchlist();
    loadPositions();
    setSelectedStock(topStocks[0]);
  }, []);

  const loadWatchlist = () => {
    setWatchlist(topStocks);
  };

  const loadPositions = () => {
    const mockPositions: Position[] = [
      {
        symbol: 'AAPL',
        shares: 50,
        avgPrice: 175.30,
        currentPrice: 182.52,
        totalValue: 9126.00,
        pnl: 361.00,
        pnlPercent: 4.12,
      },
      {
        symbol: 'MSFT',
        shares: 25,
        avgPrice: 380.00,
        currentPrice: 377.44,
        totalValue: 9436.00,
        pnl: -64.00,
        pnlPercent: -0.67,
      },
    ];
    setPositions(mockPositions);
  };

  const handlePlaceOrder = () => {
    if (!selectedStock || !quantity) {
      Alert.alert('Error', 'Please select a stock and enter quantity');
      return;
    }

    const orderValue = parseFloat(quantity) * (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : selectedStock.price);

    Alert.alert(
      'Confirm Order',
      `${selectedTab.toUpperCase()} ${quantity} shares of ${selectedStock.symbol} at ${orderType === 'market' ? 'market price' : `$${limitPrice}`}\nEstimated value: $${orderValue.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => executeOrder() },
      ]
    );
  };

  const executeOrder = () => {
    Alert.alert('Order Placed', 'Your order has been submitted successfully!');
    setQuantity('');
    setLimitPrice('');
  };

  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={[
        styles.stockItem,
        selectedStock?.symbol === item.symbol && styles.stockItemSelected
      ]}
      onPress={() => setSelectedStock(item)}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
      </View>
      <View style={styles.stockPrice}>
        <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
        <Text style={[
          styles.changeText,
          { color: item.change >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {formatChange(item.change, item.changePercent)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPositionItem = ({ item }: { item: Position }) => (
    <View style={styles.positionItem}>
      <View style={styles.positionInfo}>
        <Text style={styles.positionSymbol}>{item.symbol}</Text>
        <Text style={styles.positionShares}>{item.shares} shares</Text>
      </View>
      <View style={styles.positionValues}>
        <Text style={styles.positionValue}>{formatCurrency(item.totalValue)}</Text>
        <Text style={[
          styles.positionPnl,
          { color: item.pnl >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {formatChange(item.pnl, item.pnlPercent)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Stock Chart */}
      {selectedStock && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>
            {selectedStock.symbol} - {formatCurrency(selectedStock.price)}
          </Text>
          <LineChart
            data={chartData}
            width={width - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Trading Panel */}
      <View style={styles.tradingPanel}>
        <View style={styles.tradingTabs}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'buy' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('buy')}>
            <Text style={[styles.tabText, selectedTab === 'buy' && styles.tabTextActive]}>
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'sell' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('sell')}>
            <Text style={[styles.tabText, selectedTab === 'sell' && styles.tabTextActive]}>
              SELL
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderTypeSelector}>
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'market' && styles.orderTypeActive]}
            onPress={() => setOrderType('market')}>
            <Text style={styles.orderTypeText}>Market</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'limit' && styles.orderTypeActive]}
            onPress={() => setOrderType('limit')}>
            <Text style={styles.orderTypeText}>Limit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Enter shares"
          />
        </View>

        {orderType === 'limit' && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Limit Price</Text>
            <TextInput
              style={styles.input}
              value={limitPrice}
              onChangeText={setLimitPrice}
              keyboardType="decimal-pad"
              placeholder="Enter price"
            />
          </View>
        )}

        <LinearGradient
          colors={selectedTab === 'buy' ? ['#4CAF50', '#45a049'] : ['#F44336', '#d32f2f']}
          style={styles.orderButton}>
          <TouchableOpacity onPress={handlePlaceOrder} style={styles.orderButtonContent}>
            <Text style={styles.orderButtonText}>
              {selectedTab === 'buy' ? 'BUY' : 'SELL'} {selectedStock?.symbol}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Watchlist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Watchlist</Text>
        <FlatList
          data={watchlist}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.symbol}
          scrollEnabled={false}
        />
      </View>

      {/* Positions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Positions</Text>
        <FlatList
          data={positions}
          renderItem={renderPositionItem}
          keyExtractor={(item) => item.symbol}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  chartSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  tradingPanel: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tradingTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  orderTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  orderTypeActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  orderButton: {
    borderRadius: 12,
    marginTop: 10,
  },
  orderButtonContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
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
  stockItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stockItemSelected: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  stockName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  positionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  positionInfo: {
    flex: 1,
  },
  positionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  positionShares: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  positionValues: {
    alignItems: 'flex-end',
  },
  positionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  positionPnl: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default TradingScreen;
