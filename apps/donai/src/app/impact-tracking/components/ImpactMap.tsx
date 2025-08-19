import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, Target, Users, TrendingUp } from 'lucide-react'

interface ImpactLocation {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  campaignCount: number
  beneficiariesReached: number
  totalDonations: number
  category: string
  status: 'active' | 'completed' | 'planned'
  lastUpdate: string
}

interface ImpactMapProps {
  locations: ImpactLocation[]
  selectedLocation?: string
  onLocationSelect?: (locationId: string) => void
  compact?: boolean
}

export function ImpactMap({ locations, selectedLocation, onLocationSelect, compact = false }: ImpactMapProps) {
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'roadmap'>('roadmap')
  const [zoom, setZoom] = useState(7)
  const [center, setCenter] = useState({ lat: 45.9432, lng: 24.9668 }) // Romania center
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Romania bounds for realistic positioning
  const romaniaBounds = {
    north: 48.2659,
    south: 43.6190,
    west: 20.2201,
    east: 29.7151
  }

  const getLocationSize = (beneficiaries: number) => {
    if (beneficiaries > 1000) return 'large'
    if (beneficiaries > 500) return 'medium'
    return 'small'
  }

  const getLocationColor = (category: string, status: string) => {
    const baseColors = {
      emergency: 'from-red-400 to-red-600',
      education: 'from-blue-400 to-blue-600',
      healthcare: 'from-green-400 to-green-600',
      environment: 'from-emerald-400 to-emerald-600',
      community: 'from-purple-400 to-purple-600',
      children: 'from-pink-400 to-pink-600',
      elderly: 'from-orange-400 to-orange-600'
    }

    const opacity = status === 'active' ? '' : 'opacity-70'
    return `bg-gradient-to-br ${baseColors[category as keyof typeof baseColors] || 'from-gray-400 to-gray-600'} ${opacity}`
  }

  const getMarkerSize = (size: string) => {
    switch (size) {
      case 'large':
        return 'w-6 h-6'
      case 'medium':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency':
        return '🚨'
      case 'education':
        return '🎓'
      case 'healthcare':
        return '🏥'
      case 'environment':
        return '🌱'
      case 'community':
        return '🏘️'
      case 'children':
        return '👶'
      case 'elderly':
        return '👴'
      default:
        return '❤️'
    }
  }

  // Convert real coordinates to map coordinates (simplified)
  const projectCoordinates = (lat: number, lng: number) => {
    const mapWidth = compact ? 300 : 600
    const mapHeight = compact ? 200 : 400

    const x = ((lng - romaniaBounds.west) / (romaniaBounds.east - romaniaBounds.west)) * mapWidth
    const y = ((romaniaBounds.north - lat) / (romaniaBounds.north - romaniaBounds.south)) * mapHeight

    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) }
  }

  const handleLocationClick = (locationId: string) => {
    if (onLocationSelect) {
      onLocationSelect(locationId)
    }
  }

  const zoomIn = () => setZoom(Math.min(12, zoom + 1))
  const zoomOut = () => setZoom(Math.max(4, zoom - 1))
  const resetView = () => {
    setZoom(7)
    setCenter({ lat: 45.9432, lng: 24.9668 })
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Impact Map</h3>
            <p className="text-sm text-gray-600">Geographic distribution of our impact</p>
          </div>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2">
            <select
              value={mapView}
              onChange={(e) => setMapView(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="roadmap">Roadmap</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Map container */}
        <div
          ref={mapRef}
          className={`relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-green-100 overflow-hidden ${compact ? 'h-48' : 'h-96'
            }`}
          style={{
            backgroundImage: mapView === 'satellite'
              ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMUY0MTczIi8+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0iIzM3NDE1MSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPC9zdmc+')"
              : mapView === 'terrain'
                ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0wIDEwTDUgNUwxMCAxMEwxNSA1TDIwIDEwVjIwSDBWMTBaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvdmc+Jyk="
                : undefined
          }}
        >
          {/* Romania outline (simplified) */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M100 200 Q150 100 300 120 Q450 110 500 180 Q520 220 480 300 Q400 350 300 340 Q200 330 150 280 Q80 240 100 200 Z"
              stroke="#10B981"
              strokeWidth="2"
              fill="rgba(16, 185, 129, 0.1)"
            />
          </svg>

          {/* Location markers */}
          {locations.map((location) => {
            const { x, y } = projectCoordinates(location.coordinates.lat, location.coordinates.lng)
            const size = getLocationSize(location.beneficiariesReached)
            const isSelected = selectedLocation === location.id
            const isHovered = hoveredLocation === location.id

            return (
              <div key={location.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    relative cursor-pointer ${getMarkerSize(size)} rounded-full border-2 border-white shadow-lg
                    ${getLocationColor(location.category, location.status)}
                    ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                    ${isHovered ? 'z-20' : 'z-10'}
                  `}
                  onClick={() => handleLocationClick(location.id)}
                  onMouseEnter={() => setHoveredLocation(location.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Pulse animation for active locations */}
                  {location.status === 'active' && (
                    <div className={`absolute inset-0 rounded-full animate-ping ${getLocationColor(location.category, location.status)} opacity-30`} />
                  )}
                </motion.div>

                {/* Tooltip on hover */}
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-30"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getCategoryIcon(location.category)}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{location.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Campaigns:</span>
                            <span className="font-medium">{location.campaignCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Beneficiaries:</span>
                            <span className="font-medium">{location.beneficiariesReached.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total donations:</span>
                            <span className="font-medium">{formatCurrency(location.totalDonations)}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${location.status === 'active' ? 'bg-green-100 text-green-700' :
                              location.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'}
                          `}>
                            {location.status}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{location.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Map controls */}
        {!compact && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={zoomIn}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-white"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={zoomOut}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-white"
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetView}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-white"
            >
              <RotateCcw className="h-4 w-4 text-gray-600" />
            </motion.button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
              <span>Large Impact (1000+ beneficiaries)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
              <span>Medium Impact (500+ beneficiaries)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
              <span>Small Impact (&lt;500 beneficiaries)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary statistics */}
      {!compact && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-900">
              {locations.length}
            </div>
            <div className="text-sm text-blue-700">Locations</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-900">
              {locations.reduce((sum, loc) => sum + loc.campaignCount, 0)}
            </div>
            <div className="text-sm text-green-700">Total Campaigns</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-900">
              {locations.reduce((sum, loc) => sum + loc.beneficiariesReached, 0).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Beneficiaries</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-900">
              {formatCurrency(locations.reduce((sum, loc) => sum + loc.totalDonations, 0))}
            </div>
            <div className="text-sm text-orange-700">Total Donations</div>
          </div>
        </div>
      )}

      {locations.length === 0 && (
        <div className="text-center py-8">
          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No impact locations found</p>
          <p className="text-sm text-gray-500">Locations will appear here as campaigns are launched</p>
        </div>
      )}
    </div>
  )
}
