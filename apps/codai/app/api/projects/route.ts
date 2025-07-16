import { NextResponse } from 'next/server';
import { ProjectDiscovery, ProjectInfo } from '../../../lib/ProjectDiscovery';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const id = searchParams.get('id');

    const projectDiscovery = ProjectDiscovery.getInstance();

    let projects: ProjectInfo[];

    if (id) {
      const project = await projectDiscovery.getProjectById(id);
      return NextResponse.json({
        project: project || null,
        found: !!project,
      });
    } else if (type) {
      projects = await projectDiscovery.getProjectsByType(type);
    } else if (language) {
      projects = await projectDiscovery.getProjectsByLanguage(language);
    } else {
      projects = await projectDiscovery.discoverProjects();
    }

    // Calculate statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const inactiveProjects = projects.filter(p => p.status === 'inactive').length;
    const archivedProjects = projects.filter(p => p.status === 'archived').length;

    // Group by language
    const languageStats = projects.reduce((acc, project) => {
      acc[project.language] = (acc[project.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by type
    const typeStats = projects.reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total size
    const totalSize = projects.reduce((sum, project) => sum + project.size, 0);

    const response = {
      projects,
      statistics: {
        totalProjects,
        activeProjects,
        inactiveProjects,
        archivedProjects,
        languageStats,
        typeStats,
        totalSize,
        averageSize: totalProjects > 0 ? Math.round(totalSize / totalProjects) : 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error discovering projects:', error);

    // Return fallback mock data in case of error
    const fallbackProjects: ProjectInfo[] = [
      {
        id: 'codai-fallback',
        name: 'CODAI Platform',
        path: 'e:\\GitHub\\codai-project\\apps\\codai',
        type: 'Web Application',
        language: 'TypeScript/JavaScript',
        framework: 'Next.js',
        lastModified: new Date(),
        size: 26843546,
        status: 'active',
        description: 'AI-powered development platform with intelligent automation',
        version: '1.0.0',
        dependencies: ['next', 'react', 'typescript', 'tailwindcss'],
      },
      {
        id: 'memorai-fallback',
        name: 'MEMORAI',
        path: 'e:\\GitHub\\codai-project\\apps\\memorai',
        type: 'Web Application',
        language: 'TypeScript/JavaScript',
        framework: 'Next.js',
        lastModified: new Date(),
        size: 19234567,
        status: 'active',
        description: 'Memory management and context-aware system',
        version: '1.0.0',
        dependencies: ['next', 'react', 'prisma', '@prisma/client'],
      },
      {
        id: 'shared-ui-fallback',
        name: 'Shared UI',
        path: 'e:\\GitHub\\codai-project\\packages\\shared-ui',
        type: 'Library',
        language: 'TypeScript/JavaScript',
        framework: 'React',
        lastModified: new Date(),
        size: 8765432,
        status: 'active',
        description: 'Shared UI components and design system',
        version: '1.0.0',
        dependencies: ['react', 'typescript', 'tailwindcss'],
      },
    ];

    return NextResponse.json({
      projects: fallbackProjects,
      statistics: {
        totalProjects: fallbackProjects.length,
        activeProjects: 3,
        inactiveProjects: 0,
        archivedProjects: 0,
        languageStats: { 'TypeScript/JavaScript': 3 },
        typeStats: { 'Web Application': 2, 'Library': 1 },
        totalSize: fallbackProjects.reduce((sum, p) => sum + p.size, 0),
        averageSize: Math.round(fallbackProjects.reduce((sum, p) => sum + p.size, 0) / fallbackProjects.length),
      },
      lastUpdated: new Date().toISOString(),
      error: 'Project discovery service unavailable, showing fallback data',
    }, { status: 200 });
  }
}
