import chalk from 'chalk';

export function logDeployment(message: string) {
    console.log(chalk.blue('🚀 [DEPLOY]'), message);
}

export function logSuccess(message: string) {
    console.log(chalk.green('✅ [SUCCESS]'), message);
}

export function logError(message: string) {
    console.log(chalk.red('❌ [ERROR]'), message);
}

export function logWarning(message: string) {
    console.log(chalk.yellow('⚠️ [WARNING]'), message);
}

export function logInfo(message: string) {
    console.log(chalk.cyan('ℹ️ [INFO]'), message);
}
