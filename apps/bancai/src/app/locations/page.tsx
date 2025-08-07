'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Navigation, Clock, Phone, Mail, Calendar, Star, Filter,
  Search, Map, Building, ChevronRight, ExternalLink, Directions,
  Parking, Wifi, CreditCard, Coffee, Accessibility, Shield,
  Users, TrendingUp, Globe, SortDesc, Heart, BookOpen,
  AlertCircle, CheckCircle, Camera, MessageSquare, Settings,
  BarChart3, Activity, Target, Award, Zap, Map as MapIcon,
  DollarSign, Banknote, Car, Smartphone, QrCode, VideoIcon,
  Calculator, HelpCircle, FileText, Bell, Layers, Plus
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface BranchLocation {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  phone: string;
  email: string;
  hours: {
    [key: string]: string;
  };
  services: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  isATMOnly: boolean;
  parking: boolean;
  accessibility: boolean;
  imageUrl?: string;
}

interface ATMLocation {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  type: 'full-service' | 'deposit-only' | 'withdrawal-only';
  fees: {
    withdrawal: number;
    deposit: number;
    balance: number;
  };
  features: string[];
  hours: string;
  distance?: number;
  network: string;
}

export default function LocationsPage() {
  const { user } = useAuth();

  // Enhanced State Management
  const [activeTab, setActiveTab] = useState<'all' | 'branches' | 'atms' | 'services' | 'appointments' | 'favorites'>('branches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapView, setMapView] = useState(false);

  // Enhanced Filters and Sorting
  const [filters, setFilters] = useState({
    distance: 'all' as 'all' | '5' | '10' | '25',
    services: [] as string[],
    amenities: [] as string[],
    accessibility: false,
    openNow: false,
    hasParking: false
  });
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');

  // Analytics and Insights
  const [locationAnalytics, setLocationAnalytics] = useState({
    totalBranches: 0,
    totalATMs: 0,
    averageRating: 0,
    totalCustomers: 0,
    openLocations: 0,
    servicesCovered: 0
  });

  // Enhanced Location Features
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>([]);
  const [appointmentMode, setAppointmentMode] = useState(false);
  const [virtualTourMode, setVirtualTourMode] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);

  // User Location and Preferences
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Analytics Update Effect
  useEffect(() => {
    const updateAnalytics = () => {
      const now = new Date();
      const openBranches = branchLocations.filter(branch => isLocationOpen(branch.hours)).length;
      const openATMs = atmLocations.filter(atm => isLocationOpen(atm.hours)).length;

      setLocationAnalytics({
        totalBranches: branchLocations.length,
        totalATMs: atmLocations.length,
        averageRating: branchLocations.reduce((sum, branch) => sum + branch.rating, 0) / branchLocations.length,
        totalCustomers: branchLocations.reduce((sum, branch) => sum + branch.reviewCount, 0),
        openLocations: openBranches + openATMs,
        servicesCovered: [...new Set(branchLocations.flatMap(branch => branch.services))].length
      });
    };

    updateAnalytics();
    const interval = setInterval(updateAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        () => {
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  const branchLocations: BranchLocation[] = [
    {
      id: '1',
      name: 'Downtown Financial Center',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      phone: '+1 (555) 123-4567',
      email: 'downtown@bancai.com',
      hours: {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 2:00 PM',
        sunday: 'Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'Loans', 'Investment Services', 'Safe Deposit Boxes'],
      amenities: ['Parking', 'WiFi', 'Wheelchair Accessible', 'Coffee', 'Private Meeting Rooms'],
      rating: 4.8,
      reviewCount: 124,
      distance: 0.3,
      isATMOnly: false,
      parking: true,
      accessibility: true
    },
    {
      id: '2',
      name: 'Midtown Business Hub',
      address: {
        street: '456 Park Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10016',
        coordinates: { lat: 40.7505, lng: -73.9934 }
      },
      phone: '+1 (555) 234-5678',
      email: 'midtown@bancai.com',
      hours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 3:00 PM',
        sunday: 'Closed'
      },
      services: ['Business Banking', 'Commercial Loans', 'Treasury Services', 'International Banking'],
      amenities: ['Valet Parking', 'WiFi', 'Wheelchair Accessible', 'Conference Rooms', 'Notary Services'],
      rating: 4.6,
      reviewCount: 89,
      distance: 1.2,
      isATMOnly: false,
      parking: true,
      accessibility: true
    },
    {
      id: '3',
      name: 'Brooklyn Heights Branch',
      address: {
        street: '789 Court Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        coordinates: { lat: 40.6892, lng: -73.9942 }
      },
      phone: '+1 (555) 345-6789',
      email: 'brooklyn@bancai.com',
      hours: {
        monday: '9:00 AM - 4:00 PM',
        tuesday: '9:00 AM - 4:00 PM',
        wednesday: '9:00 AM - 4:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed'
      },
      services: ['Personal Banking', 'Mortgage Services', 'Auto Loans', 'Retirement Planning'],
      amenities: ['Street Parking', 'WiFi', 'Wheelchair Accessible', 'Kids Area'],
      rating: 4.4,
      reviewCount: 67,
      distance: 2.1,
      isATMOnly: false,
      parking: false,
      accessibility: true
    }
  ];

  const atmLocations: ATMLocation[] = [
    {
      id: '1',
      name: 'Times Square ATM',
      address: {
        street: '1540 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10036',
        coordinates: { lat: 40.7580, lng: -73.9855 }
      },
      type: 'full-service',
      fees: {
        withdrawal: 0,
        deposit: 0,
        balance: 0
      },
      features: ['24/7 Access', 'Deposit Capability', 'Multiple Languages', 'Audio Assistance'],
      hours: '24/7',
      distance: 0.1,
      network: 'BancAI Network'
    },
    {
      id: '2',
      name: 'Penn Station ATM',
      address: {
        street: '4 Pennsylvania Plaza',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7505, lng: -73.9934 }
      },
      type: 'withdrawal-only',
      fees: {
        withdrawal: 2.50,
        deposit: 0,
        balance: 1.00
      },
      features: ['24/7 Access', 'Multiple Languages'],
      hours: '24/7',
      distance: 0.5,
      network: 'Partner Network'
    },
    {
      id: '3',
      name: 'Union Square ATM',
      address: {
        street: '4 Union Square South',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        coordinates: { lat: 40.7359, lng: -73.9911 }
      },
      type: 'full-service',
      fees: {
        withdrawal: 0,
        deposit: 0,
        balance: 0
      },
      features: ['24/7 Access', 'Deposit Capability', 'Audio Assistance', 'Video Banking'],
      hours: '24/7',
      distance: 1.8,
      network: 'BancAI Network'
    }
  ];

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isOpenNow = (hours: { [key: string]: string }) => {
    const today = getCurrentDay();
    const todayHours = hours[today];

    if (!todayHours || todayHours === 'Closed') return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    // Parse hours like "9:00 AM - 5:00 PM"
    const [open, close] = todayHours.split(' - ');
    const openTime = parseTime(open);
    const closeTime = parseTime(close);

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const parseTime = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    return hour24 * 100 + minutes;
  };

  const getDirections = (coordinates: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  // Enhanced Filtering and Sorting
  const filteredBranches = useMemo(() => {
    let filtered = branchLocations.filter(branch => {
      // Search filter
      const searchMatch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.city.toLowerCase().includes(searchTerm.toLowerCase());

      // Service filter
      const serviceMatch = !serviceFilter || branch.services.includes(serviceFilter);

      // Amenity filters
      const amenityMatch = filters.amenities.length === 0 ||
        filters.amenities.every(amenity => branch.amenities.includes(amenity));

      // Other filters
      const accessibilityMatch = !filters.accessibility || branch.accessibility;
      const parkingMatch = !filters.hasParking || branch.parking;
      const openMatch = !filters.openNow || isLocationOpen(branch.hours);

      // Distance filter
      const distanceMatch = filters.distance === 'all' ||
        (branch.distance && branch.distance <= parseInt(filters.distance));

      return searchMatch && serviceMatch && amenityMatch &&
        accessibilityMatch && parkingMatch && openMatch && distanceMatch;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [branchLocations, searchTerm, serviceFilter, filters, sortBy]);

  const filteredATMs = useMemo(() => {
    let filtered = atmLocations.filter(atm => {
      // Search filter
      const searchMatch = atm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atm.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atm.address.city.toLowerCase().includes(searchTerm.toLowerCase());

      // Other filters
      const accessibilityMatch = !filters.accessibility || atm.accessibility;
      const openMatch = !filters.openNow || isLocationOpen(atm.hours);

      // Distance filter
      const distanceMatch = filters.distance === 'all' ||
        (atm.distance && atm.distance <= parseInt(filters.distance));

      return searchMatch && accessibilityMatch && openMatch && distanceMatch;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [atmLocations, searchTerm, filters, sortBy]);

  // Enhanced Utility Functions
  const toggleFavorite = (locationId: string) => {
    setFavoriteLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const scheduleAppointment = (locationId: string) => {
    setSelectedLocation(locationId);
    setAppointmentMode(true);
  };

  const startVirtualTour = (locationId: string) => {
    setSelectedLocation(locationId);
    setVirtualTourMode(true);
  };

  const resetFilters = () => {
    setFilters({
      distance: 'all',
      services: [],
      amenities: [],
      accessibility: false,
      openNow: false,
      hasParking: false
    });
    setServiceFilter(null);
    setSortBy('distance');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Branch & ATM Locations
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Find BancAI branches and ATMs near you with comprehensive location services and banking support
              </p>
            </div>

            {/* Location Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Building className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.totalBranches}</div>
                <div className="text-sm text-white/80">Branches</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <CreditCard className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.totalATMs}</div>
                <div className="text-sm text-white/80">ATMs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <CheckCircle className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.openLocations}</div>
                <div className="text-sm text-white/80">Open Now</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Star className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.averageRating.toFixed(1)}</div>
                <div className="text-sm text-white/80">Avg Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Users className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.totalCustomers.toLocaleString()}</div>
                <div className="text-sm text-white/80">Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Target className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{locationAnalytics.servicesCovered}</div>
                <div className="text-sm text-white/80">Services</div>
              </div>
            </div>

            {/* Enhanced Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { id: 'all', label: 'All Locations', icon: Globe, count: filteredBranches.length + filteredATMs.length },
                { id: 'branches', label: 'Branches', icon: Building, count: filteredBranches.length },
                { id: 'atms', label: 'ATMs', icon: CreditCard, count: filteredATMs.length },
                { id: 'services', label: 'Services', icon: Settings, count: locationAnalytics.servicesCovered },
                { id: 'appointments', label: 'Appointments', icon: Calendar, count: 0 },
                { id: 'favorites', label: 'Favorites', icon: Heart, count: favoriteLocations.length }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white/90 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMapView(!mapView)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${mapView ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Map className="h-4 w-4 mr-2" />
                {mapView ? 'List View' : 'Map View'}
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Navigation className="h-4 w-4 mr-2" />
                Use My Location
              </button>
            </div>
          </div >
        </div >
      </div >

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">Location Coverage</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-900">
              {locationAnalytics.totalBranches + locationAnalytics.totalATMs}
            </div>
            <div className="text-sm text-green-700">Total Locations</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {locationAnalytics.openLocations} currently open
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Service Quality</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-900">
              {locationAnalytics.averageRating.toFixed(1)}/5
            </div>
            <div className="text-sm text-blue-700">Average Rating</div>
            <div className="flex items-center text-xs text-blue-600">
              <Star className="h-3 w-3 mr-1" />
              {locationAnalytics.totalCustomers.toLocaleString()} reviews
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Service Range</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-900">
              {locationAnalytics.servicesCovered}
            </div>
            <div className="text-sm text-purple-700">Services Offered</div>
            <div className="flex items-center text-xs text-purple-600">
              <Zap className="h-3 w-3 mr-1" />
              Full-service banking
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">Customer Base</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(locationAnalytics.totalCustomers / locationAnalytics.totalBranches)}
            </div>
            <div className="text-sm text-orange-700">Avg per Branch</div>
            <div className="flex items-center text-xs text-orange-600">
              <Target className="h-3 w-3 mr-1" />
              Growing network
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Location Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <button
            onClick={() => setViewMode('map')}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group"
          >
            <MapIcon className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-900">Map View</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, openNow: !prev.openNow }))}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group"
          >
            <Clock className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-green-900">Open Now</span>
          </button>

          <button
            onClick={() => setAppointmentMode(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group"
          >
            <Calendar className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-900">Book Visit</span>
          </button>

          <button
            onClick={() => setVirtualTourMode(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all group"
          >
            <Camera className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-900">Virtual Tour</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all group"
          >
            <Heart className="h-8 w-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-red-900">Favorites</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, accessibility: !prev.accessibility }))}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all group"
          >
            <Accessibility className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-indigo-900">Accessible</span>
          </button>

          <button
            onClick={() => window.open('tel:1-800-BANCAI')}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition-all group"
          >
            <Phone className="h-8 w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-teal-900">Call Support</span>
          </button>

          <button
            onClick={resetFilters}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all group"
          >
            <Settings className="h-8 w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Reset</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by address, city, or location name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'branches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Building className="h-4 w-4 inline mr-2" />
                Branches ({filteredBranches.length})
              </button>
              <button
                onClick={() => setActiveTab('atms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'atms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                ATMs ({filteredATMs.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{branch.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {branch.address.street}, {branch.address.city}, {branch.address.state} {branch.address.zipCode}
                          </span>
                          {branch.distance && (
                            <span className="ml-2 text-blue-600">• {branch.distance} miles away</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{branch.rating}</span>
                            <span className="text-gray-500 ml-1">({branch.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className={`font-medium ${isOpenNow(branch.hours) ? 'text-green-600' : 'text-red-600'}`}>
                              {isOpenNow(branch.hours) ? 'Open Now' : 'Closed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {branch.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {branch.parking && (
                          <div className="flex items-center">
                            <Parking className="h-4 w-4 mr-1" />
                            <span>Parking</span>
                          </div>
                        )}
                        {branch.accessibility && (
                          <div className="flex items-center">
                            <Accessibility className="h-4 w-4 mr-1" />
                            <span>Accessible</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 mr-1" />
                          <span>WiFi</span>
                        </div>
                        <div className="flex items-center">
                          <Coffee className="h-4 w-4 mr-1" />
                          <span>Coffee</span>
                        </div>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Hours</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{getCurrentDay()}</span>
                          <span className={isOpenNow(branch.hours) ? 'text-green-600' : 'text-gray-600'}>
                            {branch.hours[getCurrentDay()]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:ml-6 lg:flex-shrink-0">
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => getDirections(branch.address.coordinates)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Directions className="h-4 w-4 mr-2" />
                        Get Directions
                      </button>
                      <a
                        href={`tel:${branch.phone}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Branch
                      </a>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Visit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATMs Tab */}
      {activeTab === 'atms' && (
        <div className="space-y-6">
          {filteredATMs.map((atm) => (
            <div key={atm.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{atm.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {atm.address.street}, {atm.address.city}, {atm.address.state} {atm.address.zipCode}
                          </span>
                          {atm.distance && (
                            <span className="ml-2 text-blue-600">• {atm.distance} miles away</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${atm.type === 'full-service'
                            ? 'bg-green-100 text-green-800'
                            : atm.type === 'deposit-only'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {atm.type.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${atm.network === 'BancAI Network'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {atm.network}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {atm.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Fees</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Withdrawal:</span>
                          <span className="ml-1 font-medium">
                            {atm.fees.withdrawal === 0 ? 'Free' : `$${atm.fees.withdrawal}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deposit:</span>
                          <span className="ml-1 font-medium">
                            {atm.fees.deposit === 0 ? 'Free' : `$${atm.fees.deposit}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Balance:</span>
                          <span className="ml-1 font-medium">
                            {atm.fees.balance === 0 ? 'Free' : `$${atm.fees.balance}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Hours</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-green-500" />
                          <span>{atm.hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:ml-6 lg:flex-shrink-0">
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => getDirections(atm.address.coordinates)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Directions className="h-4 w-4 mr-2" />
                        Get Directions
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'branches' && filteredBranches.length === 0) ||
        (activeTab === 'atms' && filteredATMs.length === 0)) && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or location.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        )}

      {/* Modern Footer with Gradient Action Cards */}
      <div className="mt-16 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl text-white overflow-hidden">
        <div className="px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help Finding the Right Location?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our location specialists are here to help you find the perfect BancAI branch or ATM for your banking needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300 text-sm mb-4">Speak with a location specialist</p>
              <div className="text-blue-300 font-medium">1-800-BANCAI</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-300 text-sm mb-4">Get instant location assistance</p>
              <div className="text-green-300 font-medium">Chat Now</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Schedule Visit</h3>
              <p className="text-gray-300 text-sm mb-4">Book an appointment online</p>
              <div className="text-purple-300 font-medium">Book Now</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Support Center</h3>
              <p className="text-gray-300 text-sm mb-4">Find answers and resources</p>
              <div className="text-orange-300 font-medium">Get Help</div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">BancAI Locations</div>
                  <div className="text-sm text-gray-300">Banking Made Simple</div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <span>© 2024 BancAI. All rights reserved.</span>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div >
  );
}
