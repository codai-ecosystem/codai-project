import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { Parser } from 'json2csv';
import YAML from 'yaml';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess } from '../utils/format.js';

export function exportCommand(): Command {
    const command = new Command('export');

    command
        .description('Export memories to file')
        .argument('<file>', 'Output file path')
        .option('-a, --agent-id <id>', 'Export memories for specific agent')
        .option('-f, --format <type>', 'Export format (json|csv|yaml)', 'json')
        .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
        .option('--after <date>', 'Export memories created after date (ISO format)')
        .option('--before <date>', 'Export memories created before date (ISO format)')
        .option('--min-importance <level>', 'Minimum importance level')
        .option('--include-metadata', 'Include full metadata in export')
        .action(async (file, options) => {
            try {
                const client = await getClient();
                const spinner = ora('Fetching memories for export...').start();

                // Build search parameters
                const searchParams: any = {
                    query: '', // Empty query to get all
                    limit: 10000 // High limit to get all matching memories
                };

                if (options.agentId) searchParams.agentId = options.agentId;
                if (options.tags) searchParams.tags = options.tags.split(',').map((t: string) => t.trim());
                if (options.after) searchParams.createdAfter = new Date(options.after);
                if (options.before) searchParams.createdBefore = new Date(options.before);
                if (options.minImportance) searchParams.minImportance = parseFloat(options.minImportance);

                const results = await client.searchMemories(searchParams);
                const memories = results.memories;

                spinner.succeed(`Found ${memories.length} memories to export`);

                if (memories.length === 0) {
                    console.log(chalk.yellow('No memories found matching the criteria'));
                    return;
                }

                // Prepare data for export
                let exportData: any;
                const exportSpinner = ora(`Exporting to ${options.format.toUpperCase()}...`).start();

                switch (options.format.toLowerCase()) {
                    case 'json':
                        exportData = JSON.stringify({
                            metadata: {
                                exportedAt: new Date().toISOString(),
                                totalMemories: memories.length,
                                filters: searchParams
                            },
                            memories: options.includeMetadata ? memories : memories.map((m: any) => ({
                                id: m.id,
                                content: m.content,
                                agentId: m.agentId,
                                importance: m.importance,
                                createdAt: m.createdAt,
                                updatedAt: m.updatedAt,
                                tags: m.metadata?.tags
                            }))
                        }, null, 2);
                        break;

                    case 'csv':
                        const fields = [
                            'id',
                            'content',
                            'agentId',
                            'importance',
                            'createdAt',
                            'updatedAt'
                        ];

                        if (options.includeMetadata) {
                            fields.push('tags', 'metadata');
                        }

                        const csvData = memories.map((m: any) => ({
                            id: m.id,
                            content: m.content.replace(/\n/g, '\\n'), // Escape newlines
                            agentId: m.agentId,
                            importance: m.importance,
                            createdAt: m.createdAt,
                            updatedAt: m.updatedAt,
                            tags: m.metadata?.tags?.join(';') || '',
                            metadata: options.includeMetadata ? JSON.stringify(m.metadata) : ''
                        }));

                        const parser = new Parser({ fields });
                        exportData = parser.parse(csvData);
                        break;

                    case 'yaml':
                    case 'yml':
                        const yamlData = {
                            metadata: {
                                exportedAt: new Date().toISOString(),
                                totalMemories: memories.length,
                                filters: searchParams
                            },
                            memories: options.includeMetadata ? memories : memories.map((m: any) => ({
                                id: m.id,
                                content: m.content,
                                agentId: m.agentId,
                                importance: m.importance,
                                createdAt: m.createdAt,
                                updatedAt: m.updatedAt,
                                tags: m.metadata?.tags
                            }))
                        };
                        exportData = YAML.stringify(yamlData);
                        break;

                    default:
                        exportSpinner.fail(`Unsupported format: ${options.format}`);
                        process.exit(1);
                }

                // Write to file
                writeFileSync(file, exportData, 'utf8');
                exportSpinner.succeed(`Exported ${memories.length} memories to ${file}`);

                // Show export summary
                console.log('');
                console.log(formatSuccess('Export Summary:'));
                console.log(`📁 File: ${chalk.cyan(file)}`);
                console.log(`📊 Format: ${chalk.yellow(options.format.toUpperCase())}`);
                console.log(`🧠 Memories: ${chalk.green(memories.length)}`);
                console.log(`📝 Size: ${chalk.gray((exportData.length / 1024).toFixed(1) + ' KB')}`);

                if (options.agentId) {
                    console.log(`🤖 Agent: ${chalk.blue(options.agentId)}`);
                }

                if (options.tags) {
                    console.log(`🏷️  Tags: ${chalk.magenta(options.tags)}`);
                }

            } catch (error) {
                console.error(formatError('Export failed:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
