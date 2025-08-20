import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess, formatMemory, truncateText } from '../utils/format.js';

export function searchCommand(): Command {
    const command = new Command('search');

    command
        .description('Search memories using semantic search')
        .argument('[query]', 'Search query')
        .option('-a, --agent-id <id>', 'Filter by agent ID')
        .option('-l, --limit <number>', 'Maximum number of results', '10')
        .option('-s, --min-score <score>', 'Minimum relevance score (0-1)', '0.0')
        .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
        .option('--importance <level>', 'Filter by minimum importance level')
        .option('--after <date>', 'Filter memories created after date (ISO format)')
        .option('--before <date>', 'Filter memories created before date (ISO format)')
        .option('--format <type>', 'Output format (table|json|list)', 'list')
        .option('--interactive', 'Interactive search mode')
        .action(async (query, options) => {
            try {
                const client = await getClient();
                let searchParams: any = {};

                if (options.interactive || !query) {
                    // Interactive mode - use simple approach to bypass TypeScript issues
                    const answers: any = await (inquirer as any).prompt([
                        {
                            type: 'input',
                            name: 'query',
                            message: 'Enter search query:',
                            default: query || '',
                            validate: (input: string) => input.trim() ? true : 'Query cannot be empty'
                        },
                        {
                            type: 'input',
                            name: 'agentId',
                            message: 'Agent ID (optional):',
                            default: options.agentId || ''
                        },
                        {
                            type: 'number',
                            name: 'limit',
                            message: 'Maximum results:',
                            default: parseInt(options.limit || '10'),
                            validate: (input: number) => input > 0 ? true : 'Limit must be positive'
                        },
                        {
                            type: 'number',
                            name: 'threshold',
                            message: 'Minimum relevance score (0-1):',
                            default: parseFloat(options.threshold || '0.0'),
                            validate: (input: number) => (input >= 0 && input <= 1) ? true : 'Score must be between 0 and 1'
                        },
                        {
                            type: 'input',
                            name: 'tags',
                            message: 'Filter by tags (comma-separated):',
                            default: options.tags || ''
                        }
                    ]);

                    searchParams = {
                        query: answers.query,
                        agentId: answers.agentId || undefined,
                        limit: answers.limit,
                        threshold: answers.threshold,
                        tags: answers.tags ? answers.tags.split(',').map((t: string) => t.trim()) : undefined
                    };
                } else {
                    // Non-interactive mode
                    searchParams = {
                        query,
                        agentId: options.agentId,
                        limit: parseInt(options.limit),
                        threshold: parseFloat(options.threshold || options.minScore || '0.0'),
                        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : undefined
                    };

                    // Add date filters if provided
                    if (options.after) {
                        searchParams.createdAfter = new Date(options.after);
                    }
                    if (options.before) {
                        searchParams.createdBefore = new Date(options.before);
                    }
                    if (options.importance) {
                        searchParams.importance = parseFloat(options.importance);
                    }
                }

                const spinner = ora(`Searching for "${searchParams.query}"...`).start();

                const results = await client.searchMemories(searchParams);

                spinner.succeed(`Found ${results.memories.length} memories`);

                if (results.memories.length === 0) {
                    console.log(chalk.yellow('No memories found matching your query.'));
                    return;
                }

                // Display results based on format
                switch (options.format) {
                    case 'json':
                        console.log(JSON.stringify(results, null, 2));
                        break;

                    case 'table':
                        const tableData = results.memories.map((memory: any) => [
                            memory.id.substring(0, 8) + '...',
                            truncateText(memory.content, 40),
                            memory.agentId,
                            memory.importance.toFixed(2),
                            memory.searchScore?.toFixed(3) || 'N/A',
                            new Date(memory.createdAt).toLocaleDateString()
                        ]);

                        console.log('\n' + chalk.bold('Search Results:'));
                        console.log('ID\t\tContent\t\t\t\t\tAgent\tImportance\tScore\tCreated');
                        console.log('-'.repeat(100));
                        tableData.forEach((row: any) => {
                            console.log(row.join('\t'));
                        });
                        break;

                    case 'list':
                    default:
                        console.log(formatSuccess('Search Results:'));
                        console.log('');

                        results.memories.forEach((memory: any, index: number) => {
                            console.log(chalk.bold(`${index + 1}. Memory ${memory.id.substring(0, 8)}...`));
                            if (memory.searchScore) {
                                console.log(chalk.cyan(`   Relevance: ${(memory.searchScore * 100).toFixed(1)}%`));
                            }
                            console.log(formatMemory(memory));
                            console.log('');
                        });

                        // Show search metadata if available
                        console.log(chalk.gray('Search Info:'));
                        console.log(chalk.gray(`- Query time: ${results.queryTime}ms`));
                        console.log(chalk.gray(`- Total found: ${results.totalFound}`));
                        if (results.metrics) {
                            console.log(chalk.gray(`- Search time: ${results.metrics.searchTime}ms`));
                            console.log(chalk.gray(`- Strategy: ${results.metrics.strategy}`));
                            console.log(chalk.gray(`- Memories scanned: ${results.metrics.memoriesScanned}`));
                        }
                        break;
                }

            } catch (error) {
                console.error(formatError('Search failed:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
