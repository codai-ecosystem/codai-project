import React from 'react';
import { Header } from '@/components/layout/Header';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { StatusBar } from '@/components/layout/StatusBar';

export default function AIDEDashboard() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Main Layout */}
      <div className="h-full flex flex-col">

        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <ProjectSidebar />

          {/* Chat Interface */}
          <ChatInterface />
        </div>

        {/* Status Bar */}
        <StatusBar />
      </div>
    </div>
  );
}
