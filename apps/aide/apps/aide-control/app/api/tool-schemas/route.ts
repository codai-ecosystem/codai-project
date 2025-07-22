/**
 * Tool Schemas API
 * Provides dynamic tool schemas and capability definitions
 * Per milestone1.prompt.md requirements
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tool-schemas
 * Returns available tool schemas and their configurations
 */
export async function GET(request: NextRequest) {
	try {
		const toolSchemas = {
			version: '1.0.0',
			tools: {
				file_manager: {
					name: 'File Manager',
					description: 'Create, read, update, and delete files in the project',
					schema: {
						type: 'object',
						properties: {
							action: {
								type: 'string',
								enum: ['create', 'read', 'update', 'delete', 'list']
							},
							path: {
								type: 'string',
								description: 'File or directory path'
							},
							content: {
								type: 'string',
								description: 'File content for create/update operations'
							}
						},
						required: ['action', 'path']
					}
				},
				package_manager: {
					name: 'Package Manager',
					description: 'Install, update, and manage project dependencies',
					schema: {
						type: 'object',
						properties: {
							action: {
								type: 'string',
								enum: ['install', 'uninstall', 'update', 'list']
							},
							packages: {
								type: 'array',
								items: { type: 'string' },
								description: 'Package names to manage'
							},
							dev: {
								type: 'boolean',
								description: 'Install as dev dependency'
							}
						},
						required: ['action']
					}
				},
				git_manager: {
					name: 'Git Manager',
					description: 'Manage git operations and version control',
					schema: {
						type: 'object',
						properties: {
							action: {
								type: 'string',
								enum: ['init', 'add', 'commit', 'push', 'pull', 'status', 'branch']
							},
							message: {
								type: 'string',
								description: 'Commit message'
							},
							files: {
								type: 'array',
								items: { type: 'string' },
								description: 'Files to add'
							}
						},
						required: ['action']
					}
				},
				terminal: {
					name: 'Terminal',
					description: 'Execute shell commands and scripts',
					schema: {
						type: 'object',
						properties: {
							command: {
								type: 'string',
								description: 'Command to execute'
							},
							cwd: {
								type: 'string',
								description: 'Working directory'
							},
							timeout: {
								type: 'number',
								description: 'Command timeout in milliseconds'
							}
						},
						required: ['command']
					}
				},
				web_browser: {
					name: 'Web Browser',
					description: 'Browse websites and extract information',
					schema: {
						type: 'object',
						properties: {
							action: {
								type: 'string',
								enum: ['navigate', 'click', 'type', 'screenshot', 'extract']
							},
							url: {
								type: 'string',
								description: 'URL to navigate to'
							},
							selector: {
								type: 'string',
								description: 'CSS selector for click/type actions'
							},
							text: {
								type: 'string',
								description: 'Text to type'
							}
						},
						required: ['action']
					}
				}
			},
			categories: {
				development: ['file_manager', 'package_manager', 'git_manager', 'terminal'],
				automation: ['web_browser', 'terminal'],
				analysis: ['web_browser']
			}
		};

		return NextResponse.json({
			success: true,
			data: toolSchemas,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Failed to get tool schemas:', error);
		return NextResponse.json(
			{ error: 'Failed to retrieve tool schemas' },
			{ status: 500 }
		);
	}
}
