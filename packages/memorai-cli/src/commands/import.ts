import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import YAML from 'yaml';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess } from '../utils/format.js';

export function importCommand(): Command {
    const command = new Command('import');

    command
        .description('Import memories from file')
        .argument('<file>', 'Input file path')
        .option('-a, --agent-id <id>', 'Override agent ID for imported memories')
        .option('-f, --format <type>', 'File format (json|csv|yaml)', 'auto')
        .option('--dry-run', 'Show what would be imported without actually importing')
        .option('--batch-size <size>', 'Number of memories to import per batch', '100')
        .option('--skip-errors', 'Continue importing even if some memories fail')
        .action(async (file, options) => {
            try {
                const spinner = ora(`Reading file ${file}...`).start();

                // Read and parse file
                const fileContent = readFileSync(file, 'utf8');
                let format = options.format;

                // Auto-detect format if needed
                if (format === 'auto') {
                    if (file.endsWith('.json')) format = 'json';
                    else if (file.endsWith('.csv')) format = 'csv';
                    else if (file.endsWith('.yaml') || file.endsWith('.yml')) format = 'yaml';
                    else {
                        spinner.fail('Cannot auto-detect file format. Use --format option.');
                        process.exit(1);
                    }
                }

                let memories: any[] = [];

                switch (format.toLowerCase()) {
                    case 'json':
                        const jsonData = JSON.parse(fileContent);
                        memories = Array.isArray(jsonData) ? jsonData : jsonData.memories || [];
                        break;

                    case 'yaml':
                    case 'yml':
                        const yamlData = YAML.parse(fileContent);
                        memories = Array.isArray(yamlData) ? yamlData : yamlData.memories || [];
                        break;

                    case 'csv':
                        // Simple CSV parsing - in production, use a proper CSV parser
                        const lines = fileContent.split('\n').filter(line => line.trim());
                        if (lines.length < 2) {
                            spinner.fail('CSV file must have at least a header and one data row');
                            process.exit(1);
                        }

                        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                        memories = lines.slice(1).map(line => {
                            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                            const memory: any = {};

                            headers.forEach((header, index) => {
                                if (values[index]) {
                                    switch (header) {
                                        case 'priority':
                                            memory[header] = values[index]; // Expect priority format (low|medium|high|critical)
                                            break;
                                        case 'tags':
                                            memory.tags = values[index] ? values[index].split(';') : [];
                                            break;
                                        case 'metadata':
                                            try {
                                                memory.metadata = JSON.parse(values[index]);
                                            } catch {
                                                // Ignore invalid JSON metadata
                                            }
                                            break;
                                        default:
                                            memory[header] = values[index];
                                    }
                                }
                            });

                            return memory;
                        });
                        break;

                    default:
                        spinner.fail(`Unsupported format: ${format}`);
                        process.exit(1);
                }

                spinner.succeed(`Parsed ${memories.length} memories from file`);

                if (memories.length === 0) {
                    console.log(chalk.yellow('No memories found in file'));
                    return;
                }

                // Validate and prepare memories
                const validMemories = memories.filter((memory: any) => {
                    if (!memory.content || typeof memory.content !== 'string') {
                        console.log(chalk.yellow(`Skipping memory without valid content: ${memory.id || 'unknown'}`));
                        return false;
                    }
                    return true;
                });

                if (validMemories.length === 0) {
                    console.log(chalk.red('No valid memories found to import'));
                    process.exit(1);
                }

                // Override agent ID if specified
                if (options.agentId) {
                    validMemories.forEach((memory: any) => {
                        memory.agentId = options.agentId;
                    });
                }

                // Dry run mode
                if (options.dryRun) {
                    console.log(formatSuccess(`Would import ${validMemories.length} memories:`));
                    console.log('');

                    validMemories.slice(0, 5).forEach((memory: any, index: number) => {
                        console.log(chalk.bold(`${index + 1}. ${memory.agentId || 'default'}`));
                        console.log(`   Content: ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`);
                        console.log(`   Priority: ${memory.priority || 'medium'}`);
                        if (memory.tags?.length) {
                            console.log(`   Tags: ${memory.tags.join(', ')}`);
                        }
                        console.log('');
                    });

                    if (validMemories.length > 5) {
                        console.log(chalk.gray(`... and ${validMemories.length - 5} more memories`));
                    }

                    return;
                }

                // Import memories
                const client = await getClient();
                const batchSize = parseInt(options.batchSize);
                let imported = 0;
                let failed = 0;

                const importSpinner = ora(`Importing ${validMemories.length} memories...`).start();

                for (let i = 0; i < validMemories.length; i += batchSize) {
                    const batch = validMemories.slice(i, i + batchSize);

                    try {
                        const responses = await client.bulkCreateMemories(batch);
                        imported += responses.length;
                        importSpinner.text = `Imported ${imported}/${validMemories.length} memories...`;
                    } catch (error) {
                        failed += batch.length;

                        if (options.skipErrors) {
                            console.log(chalk.yellow(`Failed to import batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : error}`));
                        } else {
                            importSpinner.fail(`Import failed at batch ${Math.floor(i / batchSize) + 1}`);
                            throw error;
                        }
                    }
                }

                importSpinner.succeed(`Import completed: ${imported} imported, ${failed} failed`);

                // Show import summary
                console.log('');
                console.log(formatSuccess('Import Summary:'));
                console.log(`📁 File: ${chalk.cyan(file)}`);
                console.log(`📊 Format: ${chalk.yellow(format.toUpperCase())}`);
                console.log(`✅ Imported: ${chalk.green(imported)}`);
                if (failed > 0) {
                    console.log(`❌ Failed: ${chalk.red(failed)}`);
                }

            } catch (error) {
                console.error(formatError('Import failed:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
