import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Return fallback mock data for now to avoid build issues
    const fallbackProjects = [
      {
        id: 'codai',
        name: 'CODAI Platform',
        type: 'Application',
        language: 'TypeScript',
        framework: 'Next.js',
        status: 'active',
        lastModified: new Date(),
        size: '26MB',
        description: 'AI-powered development platform'
      },
      {
        id: 'memorai',
        name: 'MEMORAI',
        type: 'Application',
        language: 'TypeScript',
        framework: 'Next.js',
        status: 'active',
        lastModified: new Date(),
        size: '19MB',
        description: 'Memory management system'
      },
      {
        id: 'shared-ui',
        name: 'Shared UI',
        type: 'Library',
        language: 'TypeScript',
        framework: 'React',
        status: 'active',
        lastModified: new Date(),
        size: '8MB',
        description: 'Shared UI components'
      }
    ];

    return NextResponse.json({
      projects: fallbackProjects,
      totalProjects: fallbackProjects.length,
      activeProjects: 3,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in projects API:', error);

    return NextResponse.json({
      projects: [],
      totalProjects: 0,
      activeProjects: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Projects API unavailable',
    }, { status: 200 });
  }
}
