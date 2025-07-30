import chalk from 'chalk';

export function logDeployment(message: string) {
    console.warn(chalk.blue('🚀 [DEPLOY]'), message);
}

export function logSuccess(message: string) {
    console.warn(chalk.green('✅ [SUCCESS]'), message);
}

export function logError(message: string) {
    console.warn(chalk.red('❌ [ERROR]'), message);
}

export function logWarning(message: string) {
    console.warn(chalk.yellow('⚠️ [WARNING]'), message);
}

export function logInfo(message: string) {
    console.warn(chalk.cyan('ℹ️ [INFO]'), message);
}
