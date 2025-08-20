import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError } from '../utils/format.js';

export function deleteCommand(): Command {
    const command = new Command('delete');

    command
        .description('Delete memories')
        .argument('[id]', 'Memory ID to delete')
        .option('-a, --agent-id <id>', 'Delete all memories for agent')
        .option('-t, --tags <tags>', 'Delete memories with specific tags (comma-separated)')
        .option('-r, --reason <reason>', 'Reason for deletion', 'CLI delete operation')
        .option('--confirm', 'Skip confirmation prompt')
        .option('--dry-run', 'Show what would be deleted without actually deleting')
        .action(async (id, options) => {
            try {
                const client = await getClient();

                if (!id && !options.agentId && !options.tags) {
                    console.error(formatError('Must specify memory ID, --agent-id, or --tags'));
                    process.exit(1);
                }

                let memories: any[] = [];

                if (id) {
                    // Delete single memory by ID
                    if (options.dryRun) {
                        console.log(chalk.yellow(`Would delete memory: ${id}`));
                        return;
                    }

                    if (!options.confirm) {
                        console.log(chalk.yellow(`Are you sure you want to delete memory ${id}? (y/N)`));
                        // In a real implementation, we'd use inquirer for confirmation
                        console.log(chalk.red('Use --confirm flag to skip this prompt'));
                        return;
                    }

                    const spinner = ora(`Deleting memory ${id}...`).start();
                    await client.deleteMemory(id);
                    spinner.succeed('Memory deleted successfully!');

                } else if (options.agentId) {
                    // Delete all memories for agent
                    const spinner = ora(`Finding memories for agent ${options.agentId}...`).start();
                    const results = await client.listMemories({ agentId: options.agentId });
                    memories = results.memories;
                    spinner.stop();

                    if (memories.length === 0) {
                        console.log(chalk.yellow(`No memories found for agent "${options.agentId}"`));
                        return;
                    }

                    if (options.dryRun) {
                        console.log(chalk.yellow(`Would delete ${memories.length} memories for agent "${options.agentId}":`));
                        memories.forEach((memory: any) => {
                            const content = memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : '');
                            console.log(`  - ${memory.id}: ${content}`);
                        });
                        return;
                    }

                    if (!options.confirm) {
                        console.log(chalk.red(`Are you sure you want to delete ${memories.length} memories for agent "${options.agentId}"? (y/N)`));
                        console.log(chalk.red('This action cannot be undone! Use --confirm flag to skip this prompt'));
                        return;
                    }

                    const deleteSpinner = ora(`Deleting ${memories.length} memories...`).start();
                    const memoryIds = memories.map((m: any) => m.id);
                    await client.bulkDeleteMemories({
                        ids: memoryIds,
                        reason: options.reason || 'Bulk delete by agent ID'
                    });
                    deleteSpinner.succeed(`Deleted ${memories.length} memories successfully!`);

                } else if (options.tags) {
                    // Delete memories with specific tags
                    const tags = options.tags.split(',').map((t: string) => t.trim());
                    const spinner = ora(`Finding memories with tags: ${tags.join(', ')}...`).start();

                    // Search for memories with these tags
                    const results = await client.searchMemories({
                        query: '', // Empty query to get all
                        tags: tags,
                        limit: 1000 // High limit to get all matching
                    });

                    memories = results.memories;
                    spinner.stop();

                    if (memories.length === 0) {
                        console.log(chalk.yellow(`No memories found with tags: ${tags.join(', ')}`));
                        return;
                    }

                    if (options.dryRun) {
                        console.log(chalk.yellow(`Would delete ${memories.length} memories with tags "${tags.join(', ')}":`));
                        memories.forEach((memory: any) => {
                            const content = memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : '');
                            console.log(`  - ${memory.id}: ${content}`);
                        });
                        return;
                    }

                    if (!options.confirm) {
                        console.log(chalk.red(`Are you sure you want to delete ${memories.length} memories with tags "${tags.join(', ')}"? (y/N)`));
                        console.log(chalk.red('This action cannot be undone! Use --confirm flag to skip this prompt'));
                        return;
                    }

                    const deleteSpinner = ora(`Deleting ${memories.length} memories...`).start();
                    const memoryIds = memories.map((m: any) => m.id);
                    await client.bulkDeleteMemories({
                        ids: memoryIds,
                        reason: options.reason || `Bulk delete by tags: ${tags.join(', ')}`
                    });
                    deleteSpinner.succeed(`Deleted ${memories.length} memories successfully!`);
                }

            } catch (error) {
                console.error(formatError('Failed to delete memories:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
