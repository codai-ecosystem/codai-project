'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from './AppContext';
import { CacheStatus as CacheStatusType } from '@/types';
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@heroui/react';

/**
 * CacheStatusItem Component
 *
 * This component displays the status of a specific cache entry
 */
const CacheStatusItem = ({
  label,
  status,
  refreshFn,
  clearFn,
}: {
  label: string;
  status: CacheStatusType;
  refreshFn?: () => Promise<any>;
  clearFn?: () => void;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'loading':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Cached';
      case 'loading':
        return 'Loading';
      case 'error':
        return 'Error';
      default:
        return 'Not Loaded';
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2">{label}</span>
        <Badge color={getStatusColor()} variant="flat" size="sm">
          {getStatusText()}
        </Badge>
      </div>
      <div className="flex gap-2">
        {refreshFn && (
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={() => refreshFn()}
            disabled={status === 'loading'}
          >
            Refresh
          </Button>
        )}
        {clearFn && (
          <Button
            color="danger"
            variant="flat"
            size="sm"
            onClick={() => clearFn()}
            disabled={status === 'loading' || status === 'idle'}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * CacheStatus Component
 *
 * This component displays the status of all cache entries
 * and provides buttons to refresh or clear the cache
 */
export default function CacheStatus() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('CacheStatus must be used within an AppProvider');
  }

  const {
    courseLoadingStates,
    lessonLoadingStates,
    reviewLoadingStates,
    userLoadingState,
    adminAnalyticsLoadingState,
    adminSettingsLoadingState,
    bookmarksLoadingState,
    wishlistLoadingState,
    getCourseLessons,
    getCourseReviews,
    getAllUsers,
    getAdminAnalytics,
    getAdminSettings,
    getBookmarkedLessons,
    getWishlistCourses,
    clearCache,
    clearAllCache,
    courses,
  } = context;

  // Helper function to get a representative course ID for demo purposes
  const getSampleCourseId = () => {
    if (courses && Object.keys(courses).length > 0) {
      return Object.keys(courses)[0];
    }
    return null;
  };

  const courseId = getSampleCourseId();

  return (
    <Card className="max-w-lg mx-auto my-8">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cache Status</h3>
        <Button
          color="danger"
          variant="flat"
          size="sm"
          onClick={() => clearAllCache()}
        >
          Clear All Cache
        </Button>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <div className="space-y-1">
          <CacheStatusItem
            label="Courses"
            status={courseLoadingStates?.['all'] || 'idle'}
            clearFn={() => clearCache('courses')}
          />

          {courseId && (
            <>
              <CacheStatusItem
                label={`Lessons (${courseId})`}
                status={
                  lessonLoadingStates?.[courseId]?.[courseId] ||
                  (Object.keys(lessonLoadingStates || {}).length > 0
                    ? 'success'
                    : 'idle')
                }
                refreshFn={() => getCourseLessons(courseId, { persist: true })}
                clearFn={() => clearCache(`lessons_${courseId}`)}
              />

              <CacheStatusItem
                label={`Reviews (${courseId})`}
                status={reviewLoadingStates?.[courseId] || 'idle'}
                refreshFn={() => getCourseReviews(courseId, { persist: true })}
                clearFn={() => clearCache(`reviews_${courseId}`)}
              />
            </>
          )}

          <CacheStatusItem
            label="Bookmarks"
            status={bookmarksLoadingState}
            refreshFn={() => getBookmarkedLessons({ persist: true })}
            clearFn={() => clearCache('bookmarks')}
          />

          <CacheStatusItem
            label="Wishlist"
            status={wishlistLoadingState}
            refreshFn={() => getWishlistCourses({ persist: true })}
            clearFn={() => clearCache('wishlist')}
          />

          {context.isAdmin && (
            <>
              <Divider />
              <h4 className="text-md font-medium mt-4 mb-2">Admin Cache</h4>

              <CacheStatusItem
                label="Users"
                status={userLoadingState || 'idle'}
                refreshFn={() =>
                  getAllUsers?.({ persist: true }) || Promise.resolve(null)
                }
                clearFn={() => clearCache('users')}
              />

              <CacheStatusItem
                label="Analytics"
                status={adminAnalyticsLoadingState || 'idle'}
                refreshFn={() =>
                  getAdminAnalytics?.({ persist: true }) ||
                  Promise.resolve(null)
                }
                clearFn={() => clearCache('adminAnalytics')}
              />

              <CacheStatusItem
                label="Settings"
                status={adminSettingsLoadingState || 'idle'}
                refreshFn={() =>
                  getAdminSettings?.({ persist: true }) || Promise.resolve(null)
                }
                clearFn={() => clearCache('adminSettings')}
              />
            </>
          )}
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="p-4">
        <p className="text-xs text-gray-500">
          Cache TTL: 5 minutes by default. Data is persisted to localStorage
          when the persist option is enabled.
        </p>
      </CardFooter>
    </Card>
  );
}
