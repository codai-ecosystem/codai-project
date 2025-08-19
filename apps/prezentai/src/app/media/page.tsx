'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Upload,
  FolderPlus,
  Image,
  Video,
  Music,
  FileText,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  Copy,
  Star,
  Calendar,
  User,
  HardDrive,
  Cloud,
  Folder,
  Tag,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Zap,
  Globe,
  Camera,
  Palette,
  Wand2
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  format: string;
  folder: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  downloads: number;
  isFavorite: boolean;
  isStarred: boolean;
  description?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
  size: number;
  color: string;
  icon: React.ReactNode;
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageLimit: number;
  recentUploads: number;
  sharedFiles: number;
}

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const mediaStats: MediaStats = {
    totalFiles: 2847,
    totalSize: 15.7,
    storageUsed: 68,
    storageLimit: 100,
    recentUploads: 23,
    sharedFiles: 156
  };

  const folders: MediaFolder[] = [
    { id: 'all', name: 'All Media', itemCount: 2847, size: 15.7, color: 'bg-purple-100 text-purple-600', icon: <Folder className="w-5 h-5" /> },
    { id: 'images', name: 'Images', itemCount: 1820, size: 8.4, color: 'bg-blue-100 text-blue-600', icon: <Image className="w-5 h-5" /> },
    { id: 'videos', name: 'Videos', itemCount: 453, size: 5.8, color: 'bg-green-100 text-green-600', icon: <Video className="w-5 h-5" /> },
    { id: 'audio', name: 'Audio', itemCount: 287, size: 1.2, color: 'bg-orange-100 text-orange-600', icon: <Music className="w-5 h-5" /> },
    { id: 'documents', name: 'Documents', itemCount: 287, size: 0.3, color: 'bg-red-100 text-red-600', icon: <FileText className="w-5 h-5" /> },
    { id: 'favorites', name: 'Favorites', itemCount: 124, size: 2.1, color: 'bg-pink-100 text-pink-600', icon: <Heart className="w-5 h-5" /> },
  ];

  const mediaItems: MediaItem[] = [
    {
      id: '1',
      name: 'Business Team Meeting',
      type: 'image',
      url: '/media/business-team.jpg',
      thumbnail: 'gradient-to-br from-blue-500 to-purple-600',
      size: 2.4,
      dimensions: { width: 1920, height: 1080 },
      format: 'JPG',
      folder: 'images',
      tags: ['business', 'team', 'corporate'],
      uploadedAt: '2 hours ago',
      uploadedBy: 'Design Team',
      downloads: 847,
      isFavorite: true,
      isStarred: true,
      description: 'Professional business team collaboration photo'
    },
    {
      id: '2',
      name: 'Product Demo Video',
      type: 'video',
      url: '/media/product-demo.mp4',
      thumbnail: 'gradient-to-br from-green-500 to-blue-500',
      size: 156.8,
      dimensions: { width: 1920, height: 1080 },
      duration: 180,
      format: 'MP4',
      folder: 'videos',
      tags: ['product', 'demo', 'marketing'],
      uploadedAt: '1 day ago',
      uploadedBy: 'Marketing Team',
      downloads: 523,
      isFavorite: false,
      isStarred: true,
      description: 'Comprehensive product demonstration and features overview'
    },
    {
      id: '3',
      name: 'Background Music Pack',
      type: 'audio',
      url: '/media/bg-music.mp3',
      thumbnail: 'gradient-to-br from-purple-500 to-pink-500',
      size: 8.7,
      duration: 240,
      format: 'MP3',
      folder: 'audio',
      tags: ['music', 'background', 'ambient'],
      uploadedAt: '3 days ago',
      uploadedBy: 'Audio Team',
      downloads: 234,
      isFavorite: true,
      isStarred: false,
      description: 'Ambient background music for presentations'
    },
    {
      id: '4',
      name: 'Company Guidelines',
      type: 'document',
      url: '/media/guidelines.pdf',
      thumbnail: 'gradient-to-br from-orange-500 to-red-500',
      size: 1.2,
      format: 'PDF',
      folder: 'documents',
      tags: ['guidelines', 'company', 'policy'],
      uploadedAt: '1 week ago',
      uploadedBy: 'HR Team',
      downloads: 156,
      isFavorite: false,
      isStarred: true,
      description: 'Official company brand guidelines and policies'
    },
    {
      id: '5',
      name: 'Creative Mockup Set',
      type: 'image',
      url: '/media/mockups.jpg',
      thumbnail: 'gradient-to-br from-pink-500 to-purple-500',
      size: 4.2,
      dimensions: { width: 2400, height: 1600 },
      format: 'JPG',
      folder: 'images',
      tags: ['mockup', 'creative', 'design'],
      uploadedAt: '2 weeks ago',
      uploadedBy: 'Creative Studio',
      downloads: 678,
      isFavorite: true,
      isStarred: false,
      description: 'High-quality design mockups for presentations'
    },
    {
      id: '6',
      name: 'Animated Logo Reveal',
      type: 'video',
      url: '/media/logo-animation.mp4',
      thumbnail: 'gradient-to-br from-indigo-500 to-blue-500',
      size: 23.4,
      dimensions: { width: 1280, height: 720 },
      duration: 15,
      format: 'MP4',
      folder: 'videos',
      tags: ['logo', 'animation', 'branding'],
      uploadedAt: '3 weeks ago',
      uploadedBy: 'Motion Graphics',
      downloads: 892,
      isFavorite: false,
      isStarred: true,
      description: 'Professional animated logo reveal sequence'
    }
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return 0;
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Media Library
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and organize your presentation media assets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-purple-200 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2">
                <FolderPlus className="w-4 h-4" />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Overview', href: '/prezentai', current: false },
              { name: 'Presentations', href: '/prezentai/presentations', current: false },
              { name: 'Templates', href: '/prezentai/templates', current: false },
              { name: 'Media Library', href: '/prezentai/media', current: true },
              { name: 'Analytics', href: '/prezentai/analytics', current: false },
              { name: 'Settings', href: '/prezentai/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Storage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaStats.totalFiles.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{mediaStats.totalSize} GB</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Cloud className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{mediaStats.storageUsed}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{mediaStats.recentUploads}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaStats.sharedFiles}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Share2 className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Wand2 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex lg:flex-row flex-col gap-8">

          {/* Folders Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${selectedFolder === folder.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'hover:bg-purple-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${selectedFolder === folder.id ? 'bg-white/20' : folder.color}`}>
                        {folder.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{folder.name}</p>
                        <p className={`text-xs ${selectedFolder === folder.id ? 'text-white/70' : 'text-gray-500'}`}>
                          {folder.itemCount} items • {folder.size} GB
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Media Grid */}
          <div className="flex-1">

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 mb-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search media files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="name">Name</option>
                    <option value="size">File Size</option>
                    <option value="downloads">Most Downloaded</option>
                  </select>

                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700">
                      {selectedItems.length} item(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Download All
                      </button>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Add to Folder
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Media Items Grid/List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`group ${viewMode === 'grid'
                      ? 'bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-300'
                      : 'bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300'
                    }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Media Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <div className={`w-full h-full bg-${item.thumbnail} flex items-center justify-center`}>
                          <div className="text-white text-4xl opacity-80">
                            {item.type === 'image' && <Image />}
                            {item.type === 'video' && <Video />}
                            {item.type === 'audio' && <Music />}
                            {item.type === 'document' && <FileText />}
                          </div>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <button className="bg-white/90 text-gray-800 p-2 rounded-lg hover:bg-white transition-colors duration-200">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="bg-white/90 text-gray-800 p-2 rounded-lg hover:bg-white transition-colors duration-200">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Selection Checkbox */}
                        <div className="absolute top-3 left-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 text-purple-600 bg-white/80 border-white rounded focus:ring-purple-500"
                          />
                        </div>

                        {/* Favorite Star */}
                        {item.isStarred && (
                          <div className="absolute top-3 right-3">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                        )}

                        {/* File Type Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium uppercase">
                            {item.format}
                          </span>
                        </div>

                        {/* Duration for videos/audio */}
                        {item.duration && (
                          <div className="absolute bottom-3 right-3">
                            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                              {formatDuration(item.duration)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Media Details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 truncate">
                            {item.name}
                          </h3>
                          <button className={`ml-2 ${item.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors duration-200`}>
                            <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{formatFileSize(item.size * 1024 * 1024)}</span>
                          {item.dimensions && (
                            <span>{item.dimensions.width}×{item.dimensions.height}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>by {item.uploadedBy}</span>
                          <span>{item.uploadedAt}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {item.downloads} downloads
                          </span>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-6">
                      {/* Media Thumbnail */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className={`w-full h-full bg-${item.thumbnail} rounded-lg flex items-center justify-center`}>
                          <div className="text-white text-lg opacity-80">
                            {item.type === 'image' && <Image />}
                            {item.type === 'video' && <Video />}
                            {item.type === 'audio' && <Music />}
                            {item.type === 'document' && <FileText />}
                          </div>
                        </div>
                        {item.isStarred && (
                          <div className="absolute -top-1 -right-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200">
                            {item.name}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase font-medium ml-4">
                            {item.format}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {item.description}
                        </p>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{formatFileSize(item.size * 1024 * 1024)}</span>
                          {item.dimensions && (
                            <span>{item.dimensions.width}×{item.dimensions.height}</span>
                          )}
                          {item.duration && (
                            <span>{formatDuration(item.duration)}</span>
                          )}
                          <span>{item.downloads} downloads</span>
                          <span>by {item.uploadedBy}</span>
                          <span>{item.uploadedAt}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                        />
                        <button className={`${item.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors duration-200`}>
                          <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>

      {/* Modern Footer */ }
  <motion.footer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.7 }}
    className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white mt-16"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold mb-4">PrezentAI Media Library</h3>
          <p className="text-purple-200 mb-6 max-w-md">
            Store, organize, and manage all your presentation media assets in one place.
            From high-quality images to videos and audio files, everything you need for stunning presentations.
          </p>
          <div className="flex space-x-4">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <Camera className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <Video className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <Music className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Media Tools</h4>
          <ul className="space-y-2 text-purple-200">
            <li><a href="#" className="hover:text-white transition-colors duration-200">AI Image Generator</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Stock Photo Library</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Video Editor</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Audio Mixer</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Storage & Sync</h4>
          <ul className="space-y-2 text-purple-200">
            <li><a href="#" className="hover:text-white transition-colors duration-200">Cloud Storage</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Team Collaboration</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Version Control</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Backup & Restore</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-purple-200 text-sm">
          © 2025 PrezentAI Media Library. Organize your creative assets with precision.
        </p>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            💾 15.7 GB of Premium Media Assets
          </span>
        </div>
      </div>
    </div>
  </motion.footer>
    </div >
  );
}
