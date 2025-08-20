import chalk from 'chalk';

export function formatError(message: string): string {
    return chalk.red(`❌ ${message}`);
}

export function formatSuccess(message: string): string {
    return chalk.green(`✅ ${message}`);
}

export function formatWarning(message: string): string {
    return chalk.yellow(`⚠️  ${message}`);
}

export function formatInfo(message: string): string {
    return chalk.blue(`ℹ️  ${message}`);
}

export function formatDebug(message: string): string {
    if (process.env.MEMORAI_DEBUG === 'true') {
        return chalk.gray(`🐛 ${message}`);
    }
    return '';
}

export function formatMemory(memory: any): string {
    const content = memory.content.length > 100
        ? memory.content.substring(0, 100) + '...'
        : memory.content;

    return [
        chalk.cyan(`ID: ${memory.id}`),
        chalk.white(`Content: ${content}`),
        chalk.yellow(`Agent: ${memory.agentId}`),
        chalk.green(`Importance: ${memory.importance}`),
        chalk.gray(`Created: ${new Date(memory.createdAt).toLocaleString()}`),
        memory.metadata?.tags?.length
            ? `Tags: ${memory.metadata.tags.map((tag: string) => chalk.blue(tag)).join(', ')}`
            : ''
    ].filter(Boolean).join('\n');
}

export function formatTable(data: any[], headers: string[]): string {
    // Simple table formatting - could be enhanced with the 'table' package
    const maxLengths = headers.map((header, i) =>
        Math.max(header.length, ...data.map(row => String(row[i] || '').length))
    );

    const separator = maxLengths.map(len => '-'.repeat(len)).join(' | ');
    const headerRow = headers.map((header, i) => header.padEnd(maxLengths[i])).join(' | ');

    const rows = data.map(row =>
        headers.map((_, i) => String(row[i] || '').padEnd(maxLengths[i])).join(' | ')
    );

    return [headerRow, separator, ...rows].join('\n');
}

export function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}
