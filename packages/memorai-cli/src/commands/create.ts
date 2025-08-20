import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess } from '../utils/format.js';

export function createMemoryCommand(): Command {
    const command = new Command('create');

    command
        .description('Create a new memory')
        .argument('[content]', 'Memory content')
        .option('-t, --tags <tags>', 'Comma-separated tags')
        .option('-p, --priority <level>', 'Priority level (low|medium|high|critical)', 'medium')
        .option('-a, --agent-id <id>', 'Agent ID', 'default')
        .option('-m, --metadata <json>', 'Additional metadata as JSON')
        .option('--interactive', 'Interactive mode')
        .action(async (content, options) => {
            try {
                const client = await getClient();
                let memoryData: any = {};

                if (options.interactive || !content) {
                    // Interactive mode
                    const answers = await inquirer.prompt([
                        {
                            type: 'editor',
                            name: 'content',
                            message: 'Enter memory content:',
                            default: content || '',
                            validate: (input: string) => input.trim() ? true : 'Content cannot be empty'
                        },
                        {
                            type: 'input',
                            name: 'tags',
                            message: 'Tags (comma-separated):',
                            default: options.tags || ''
                        },
                        {
                            type: 'list',
                            name: 'priority',
                            message: 'Priority level:',
                            choices: ['low', 'medium', 'high', 'critical'],
                            default: 'medium'
                        },
                        {
                            type: 'input',
                            name: 'agentId',
                            message: 'Agent ID:',
                            default: options.agentId || ''
                        },
                        {
                            type: 'input',
                            name: 'metadata',
                            message: 'Additional metadata (JSON):',
                            default: options.metadata || '{}',
                            validate: (input: string) => {
                                try {
                                    JSON.parse(input);
                                    return true;
                                } catch {
                                    return 'Invalid JSON format';
                                }
                            }
                        }
                    ]);

                    memoryData = {
                        content: answers.content,
                        agentId: answers.agentId,
                        priority: answers.priority,
                        tags: answers.tags ? answers.tags.split(',').map((t: string) => t.trim()) : [],
                        metadata: JSON.parse(answers.metadata),
                        generateEmbeddings: true
                    };
                } else {
                    // Non-interactive mode  
                    const priorityMap: Record<string, any> = {
                        '0': 'low', '0.25': 'low',
                        '0.5': 'medium', '0.75': 'high',
                        '1': 'critical'
                    };

                    memoryData = {
                        content,
                        agentId: options.agentId,
                        priority: options.priority === 'medium' ? 'medium' : priorityMap[options.priority] || options.priority,
                        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
                        metadata: JSON.parse(options.metadata || '{}'),
                        generateEmbeddings: true
                    };
                }

                const spinner = ora('Creating memory...').start();

                const response = await client.createMemory(memoryData);
                const memory = response.memory;

                spinner.succeed('Memory created successfully!');

                console.log(formatSuccess('Memory Details:'));
                console.log(`ID: ${chalk.cyan(memory.id)}`);
                console.log(`Content: ${chalk.white(memory.content.substring(0, 100))}${memory.content.length > 100 ? '...' : ''}`);
                console.log(`Agent ID: ${chalk.yellow(memory.agentId)}`);
                console.log(`Priority: ${chalk.green(memory.priority)}`);
                console.log(`Created: ${chalk.gray(new Date(memory.createdAt).toLocaleString())}`);

                if (memory.tags && memory.tags.length) {
                    console.log(`Tags: ${memory.tags.map((tag: string) => chalk.blue(tag)).join(', ')}`);
                }

            } catch (error) {
                console.error(formatError('Failed to create memory:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
