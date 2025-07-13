'use client';

import React, { createContext, useState, useEffect } from 'react';

// Simple fallback context for when Firebase is not configured
export const AppContext = createContext<any>({
  isDark: false,
  colorScheme: 'modern-purple',
  user: null,
  authLoading: false,
  toggleTheme: () => { },
  handleColorSchemeChange: () => { },
  openModal: () => { },
  closeModal: () => { },
  updateModal: () => { },
  courses: {},
  lessons: {},
  reviews: {},
  products: [],
  userPaidProducts: [],
  lessonProgress: {},
  isAdmin: false,
  // Placeholder functions
  getCourseLessons: () => Promise.resolve(() => { }),
  getCourseReviews: () => Promise.resolve(() => { }),
  saveLessonProgress: () => Promise.resolve(false),
  markLessonComplete: () => Promise.resolve(false),
  getAllUsers: () => Promise.resolve(null),
  assignCourseToUser: () => Promise.resolve(false),
  getAdminAnalytics: () => Promise.resolve(null),
  getAdminSettings: () => Promise.resolve(null),
  updateAdminSettings: () => Promise.resolve(false),
  getBookmarkedLessons: () => Promise.resolve(),
  toggleBookmarkLesson: () => Promise.resolve(),
  getWishlistCourses: () => Promise.resolve(),
  addToWishlist: () => Promise.resolve(),
  removeFromWishlist: () => Promise.resolve(),
  fetchCourseById: () => Promise.resolve(),
  fetchLessonsForCourse: () => Promise.resolve(),
  getCourseById: () => Promise.resolve(null),
  clearCache: () => { },
  clearAllCache: () => { },
  getCacheStatus: () => 'idle',
  isRequestPending: () => false,
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [colorScheme, setColorScheme] = useState('modern-purple');

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);

    // Remove all existing color scheme classes
    document.documentElement.classList.remove(
      'theme-modern-purple',
      'theme-black-white',
      'theme-green-neon',
      'theme-blue-ocean',
      'theme-brown-sunset',
      'theme-yellow-morning',
      'theme-red-blood',
      'theme-pink-candy'
    );

    document.documentElement.classList.add(`theme-${scheme}`);
    localStorage.setItem('colorScheme', scheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedColorScheme = localStorage.getItem('colorScheme');

    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldUseDark);

    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }

    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
      document.documentElement.classList.add(`theme-${savedColorScheme}`);
    } else {
      document.documentElement.classList.add('theme-modern-purple');
    }
  }, []);

  const contextValue = {
    isDark,
    colorScheme,
    user: null,
    authLoading: false,
    toggleTheme,
    handleColorSchemeChange,
    openModal: () => { },
    closeModal: () => { },
    updateModal: () => { },
    courses: {},
    lessons: {},
    reviews: {},
    products: [],
    userPaidProducts: [],
    lessonProgress: {},
    isAdmin: false,
    // Placeholder functions that won't cause errors
    getCourseLessons: () => Promise.resolve(() => { }),
    getCourseReviews: () => Promise.resolve(() => { }),
    saveLessonProgress: () => Promise.resolve(false),
    markLessonComplete: () => Promise.resolve(false),
    getAllUsers: () => Promise.resolve(null),
    assignCourseToUser: () => Promise.resolve(false),
    getAdminAnalytics: () => Promise.resolve(null),
    getAdminSettings: () => Promise.resolve(null),
    updateAdminSettings: () => Promise.resolve(false),
    getBookmarkedLessons: () => Promise.resolve(),
    toggleBookmarkLesson: () => Promise.resolve(),
    getWishlistCourses: () => Promise.resolve(),
    addToWishlist: () => Promise.resolve(),
    removeFromWishlist: () => Promise.resolve(),
    fetchCourseById: () => Promise.resolve(),
    fetchLessonsForCourse: () => Promise.resolve(),
    getCourseById: () => Promise.resolve(null),
    clearCache: () => { },
    clearAllCache: () => { },
    getCacheStatus: () => 'idle',
    isRequestPending: () => false,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
