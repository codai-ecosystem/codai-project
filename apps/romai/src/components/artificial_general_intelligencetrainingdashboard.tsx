/**
 * AGI Training Dashboard Component - REAL DATA ONLY
 * Comprehensive monitoring interface for RomAI AGI development
 * NO FAKE DATA - Direct integration with AGI server on port 6101
 */

'use client';

import React from 'react';
import RealAGITrainingDashboard from './RealAGITrainingDashboard';

// This component now delegates to the REAL AGI Training Dashboard
// All fake data has been eliminated - only real server data is displayed
export default function AGITrainingDashboard() {
    return <RealAGITrainingDashboard />;
}
