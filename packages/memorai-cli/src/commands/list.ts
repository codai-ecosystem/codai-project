import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess, formatMemory } from '../utils/format.js';

export function listCommand(): Command {
    const command = new Command('list');

    command
        .description('List memories for an agent')
        .option('-a, --agent-id <id>', 'Agent ID', 'default')
        .option('-l, --limit <number>', 'Maximum number of results', '20')
        .option('-o, --offset <number>', 'Offset for pagination', '0')
        .option('--format <type>', 'Output format (list|json|table)', 'list')
        .option('--sort <field>', 'Sort by field (created|importance|content)', 'created')
        .option('--order <direction>', 'Sort order (asc|desc)', 'desc')
        .action(async (options) => {
            try {
                const client = await getClient();
                const spinner = ora(`Loading memories for agent ${options.agentId}...`).start();

                const results = await client.listMemories({
                    agentId: options.agentId,
                    limit: parseInt(options.limit),
                    page: Math.floor(parseInt(options.offset) / parseInt(options.limit)) + 1 // Convert offset to page
                });

                spinner.succeed(`Found ${results.memories.length} memories`);

                if (results.memories.length === 0) {
                    console.log(chalk.yellow(`No memories found for agent "${options.agentId}".`));
                    return;
                }

                // Sort memories
                const sortField = options.sort;
                const sortOrder = options.order;
                results.memories.sort((a: any, b: any) => {
                    let aVal, bVal;
                    switch (sortField) {
                        case 'importance':
                            aVal = a.importance;
                            bVal = b.importance;
                            break;
                        case 'content':
                            aVal = a.content.toLowerCase();
                            bVal = b.content.toLowerCase();
                            break;
                        case 'created':
                        default:
                            aVal = new Date(a.createdAt).getTime();
                            bVal = new Date(b.createdAt).getTime();
                            break;
                    }

                    if (sortOrder === 'asc') {
                        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    } else {
                        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                    }
                });

                // Display results
                switch (options.format) {
                    case 'json':
                        console.log(JSON.stringify(results, null, 2));
                        break;

                    case 'table':
                        console.log('\n' + chalk.bold('Memories:'));
                        console.log('ID\t\tContent\t\t\t\t\tImportance\tCreated');
                        console.log('-'.repeat(80));
                        results.memories.forEach((memory: any) => {
                            const content = memory.content.length > 40
                                ? memory.content.substring(0, 40) + '...'
                                : memory.content;
                            console.log([
                                memory.id.substring(0, 8) + '...',
                                content.padEnd(40),
                                memory.importance.toFixed(2),
                                new Date(memory.createdAt).toLocaleDateString()
                            ].join('\t'));
                        });
                        break;

                    case 'list':
                    default:
                        console.log(formatSuccess(`Memories for agent "${options.agentId}":`));
                        console.log('');

                        results.memories.forEach((memory: any, index: number) => {
                            console.log(chalk.bold(`${index + 1}. Memory ${memory.id.substring(0, 8)}...`));
                            console.log(formatMemory(memory));
                            console.log('');
                        });

                        // Show pagination info
                        const totalShown = parseInt(options.offset) + results.memories.length;
                        console.log(chalk.gray(`Showing ${parseInt(options.offset) + 1}-${totalShown} memories`));
                        if (results.memories.length === parseInt(options.limit)) {
                            console.log(chalk.yellow(`Use --offset ${totalShown} to see more results`));
                        }
                        break;
                }

            } catch (error) {
                console.error(formatError('Failed to list memories:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
