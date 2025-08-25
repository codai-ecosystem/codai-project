# State Management Migration Guide
        
## Overview
This guide helps you migrate from useState patterns to modern Zustand stores.

## Migration Steps

### 1. Replace useState with Zustand hooks

**Before (useState):**
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState(null);
```

**After (Zustand):**
```tsx
import { useMemoraiStore } from '@/stores';

// Use selectors for optimized re-renders
const loading = useMemoraiStore(state => state.isLoading);
const error = useMemoraiStore(state => state.error);
const setLoading = useMemoraiStore(state => state.setLoading);
const setError = useMemoraiStore(state => state.setError);

// Or use the convenience hooks
const loading = useMemoraiLoading();
const error = useMemoraiError();
```

### 2. Update component patterns

**Before:**
```tsx
useEffect(() => {
  setLoading(true);
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

**After:**
```tsx
useEffect(() => {
  setLoading(true);
  fetchData()
    .then((data) => {
      // Store data in Zustand
      setData(data);
    })
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

### 3. Cross-component state sharing

With Zustand, state is automatically shared across components without prop drilling:

```tsx
// Any component can access the same state
const Component1 = () => {
  const error = useMemoraiError();
  return error ? <ErrorDisplay error={error} /> : null;
};

const Component2 = () => {
  const setError = useMemoraiStore(state => state.setError);
  return <Button onClick={() => setError('Something went wrong')} />;
};
```

## Apps Analysis Results:


### Memorai
- **useState count**: 5
- **Priority**: LOW
- **Has Zustand**: Yes
- **State patterns found**: activeTab, selectedTimeRange, selectedMetricCategory, isLoading, selectedChart

### Romai
- **useState count**: 43
- **Priority**: HIGH
- **Has Zustand**: No
- **State patterns found**: realTimeMetrics, isUpdating, testResults, runningTests, selectedCategory, isLoading, activeTab, agiStats, error, trainingMetrics, trainingHistory, isOpen, windowWidth, agiData, loading, lastUpdate, selectedAlert, selfReflections, cognitiveProcesses, knowledgeGraph, isLearning, learningMetrics, status, metrics, isLiveMode, currentProcess, recentThoughts, consciousnessMetrics, connectionSpeed

### Bancai
- **useState count**: 166
- **Priority**: HIGH
- **Has Zustand**: Yes
- **State patterns found**: accounts, filteredAccounts, showBalances, filter, selectedAccount, isLoading, showAddAccount, activeTab, dateRange, selectedCategory, showProjections, searchTerm, filterType, sortBy, showFilterTags, showBalance, selectedServiceType, selectedStatus, showFilters, showCardNumbers, selectedCard, selectedType, paymentAmount, paymentType, paymentDate, paymentMethod, isRecurring, recurringFrequency, transactions, alerts, selectedPeriod, selectedDocument, viewMode, fileFormat, securityFilter, expandedFAQ, selectedTimeRange, alertsEnabled, helpAnalytics, selectedPolicy, filterStatus, searchQuery, selectedTimeframe, filterSector, filters, investmentAnalytics, watchlist, investmentGoals, rebalanceMode, researchMode, selectedLoan, showCalculator, selectedLocation, mapView, locationAnalytics, favoriteLocations, appointmentMode, virtualTourMode, serviceFilter, userLocation, locationPermission, selectedMethod, loading, balanceVisible, selectedDateRange, showAddMethod, notifications, isEditing, showPassword, currentPassword, newPassword, confirmPassword, profile, editedProfile, showSensitiveInfo, twoFactorEnabled, selectedEvents, activeSection, settingsAnalytics, securitySettings, notificationSettings, supportAnalytics

### Codai
- **useState count**: 64
- **Priority**: HIGH
- **Has Zustand**: Yes
- **State patterns found**: messages, input, isLoading, selectedModel, showHistory, selectedPeriod, activeTab, refreshing, selectedEndpoint, searchTerm, selectedMethod, selectedStatus, showCreateModal, testResults, isTestingAPI, newEndpoint, selectedTab, selectedProvider, selectedEnvironment, searchQuery, autoRefresh, selectedFilter, selectedPR, showAddModal, selectedMetric, selectedCategory, statusFilter, selectedContainers, viewMode, selectedDatabase, selectedType, queryInput, selectedView, sortBy, selectedLanguage, selectedTheme, code, showPreview, showAI, showFileTree

### Admin
- **useState count**: 128
- **Priority**: HIGH
- **Has Zustand**: Yes
- **State patterns found**: selectedTimeRange, selectedCategory, refreshing, dateRange, analyticsMetrics, userAnalytics, systemAnalytics, businessMetrics, userActivityChart, revenueChart, deviceChart, searchTerm, selectedFilters, currentPage, itemsPerPage, sortBy, sortOrder, selectedLogs, showFilters, selectedLog, auditLogs, auditStats, timeFilter, selectedMetric, systemMetrics, services, securityAlerts, recentActivity, selectedTab, timeRange, alertFilter, loginAttempts, securityMetrics, complianceChecks, statusFilter, healthFilter, selectedService, showConfiguration, bulkActions, activeTab, saving, testingConnection, showPasswords, hasChanges, settings, systemInfo, users, filteredUsers, selectedRole, selectedStatus, selectedUsers, isLoading, showCreateModal, userStats, alerts, selectedFilter, isRefreshing, isMobileMenuOpen, showModal, notification, isClient, currentTime, gestureInfo, quickRefreshActive, systemMonitorExpanded, userManagementVisible, bulkOperationsMode, quickFiltersActive, emergencyDashboard, adminStats, stats, systemHealth, lastUpdated

### Hub
- **useState count**: 93
- **Priority**: HIGH
- **Has Zustand**: Yes
- **State patterns found**: analyticsData, selectedTimeRange, activeTab, isRefreshing, applications, filteredApps, selectedApp, showAppModal, showDeployModal, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, providers, email, password, isLoading, error, formData, success, systemMetrics, serviceStatuses, recentActivity, alerts, lastUpdated, apps, viewMode, targets, incidents, filteredTargets, selectedType, selectedAlert, showAlertModal, systemHealth, services, filteredServices, selectedService, showServiceModal, settings, hasUnsavedChanges, showAdvanced, saveStatus, workflows, filteredWorkflows, selectedWorkflow, showWorkflowModal, showCreateModal, workflowStats, activeSection, editingConfig, configValues, showSensitive, gestureRecognition, activeCategory, isCalibrating, executionHistory, gestureCommands, ecosystemStats, nodes, connections, selectedNode

### Id
- **useState count**: 50
- **Priority**: HIGH
- **Has Zustand**: No
- **State patterns found**: activeTab, selectedLog, showFilters, viewMode, exportModal, filters, showPassword, email, password, isLoading, error, formData, success, selectedProvider, showAddProvider, selectedTimeRange, refreshing, isLogin, errors, selectedIncident, showPolicyModal, selectedSessions, searchTerm, selectedStatus, selectedDevice, showSessionDetails, selectedSession, autoRefresh, activeSection, unsavedChanges, showConfigModal, selectedService, testResults, selectedUsers, selectedRole, showUserModal, selectedUser


## Testing Migration

1. Start with low-complexity components
2. Test each component after migration
3. Use React Developer Tools to verify state updates
4. Check that persistence works correctly

## Performance Benefits

- Automatic re-render optimization with selectors
- Better TypeScript integration
- Smaller bundle size compared to Redux
- Built-in persistence and middleware support

## Next Steps

1. Run the created stores in your applications
2. Gradually migrate useState patterns to Zustand
3. Add proper TypeScript types to generated stores
4. Test thoroughly in development
5. Consider adding more middleware as needed (devtools, subscriptions)
