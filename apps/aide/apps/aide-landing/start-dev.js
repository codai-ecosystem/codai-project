#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const net = require('net');
const path = require('path');

const PORT = 42434;

console.log(`Starting AIDE Landing dev server on port ${PORT}...`);

function killProcessOnPort(port) {
	return new Promise((resolve) => {
		const command = process.platform === 'win32'
			? `netstat -ano | findstr :${port}`
			: `lsof -ti:${port}`;

		exec(command, (error, stdout) => {
			if (error || !stdout.trim()) {
				console.log(`No processes found using port ${port}`);
				resolve();
				return;
			}

			if (process.platform === 'win32') {
				// Parse Windows netstat output
				const lines = stdout.trim().split('\n');
				const pids = new Set();

				for (const line of lines) {
					const parts = line.trim().split(/\s+/);
					if (parts.length >= 5) {
						const pid = parts[4];
						if (pid && pid !== '0') {
							pids.add(pid);
						}
					}
				}

				if (pids.size > 0) {
					console.log(`Found ${pids.size} process(es) using port ${port}, terminating...`);
					pids.forEach(pid => {
						exec(`taskkill /f /pid ${pid}`, (killError) => {
							if (killError) {
								console.log(`Could not terminate process ${pid}: ${killError.message}`);
							} else {
								console.log(`Process ${pid} terminated successfully`);
							}
						});
					});
				}
			} else {
				// Unix/Linux/macOS
				const pids = stdout.trim().split('\n');
				console.log(`Found ${pids.length} process(es) using port ${port}, terminating...`);
				pids.forEach(pid => {
					if (pid) {
						exec(`kill -9 ${pid}`, (killError) => {
							if (killError) {
								console.log(`Could not terminate process ${pid}: ${killError.message}`);
							} else {
								console.log(`Process ${pid} terminated successfully`);
							}
						});
					}
				});
			}

			// Wait for port to be freed
			setTimeout(resolve, 2000);
		});
	});
}

function isPortInUse(port) {
	return new Promise((resolve) => {
		const server = net.createServer();
		server.listen(port, () => {
			server.close(() => resolve(false));
		});
		server.on('error', () => resolve(true));
	});
}

async function startDevServer() {
	try {
		// Kill any processes using the port
		await killProcessOnPort(PORT);

		// Double-check if port is still in use
		const portInUse = await isPortInUse(PORT);
		if (portInUse) {
			console.log(`Port ${PORT} is still in use, waiting...`);
			await new Promise(resolve => setTimeout(resolve, 3000));
		}

		console.log('Starting Next.js dev server...');

		// Try different ways to start Next.js
		const nextPaths = [
			path.join(__dirname, 'node_modules', '.bin', 'next'),
			path.join(__dirname, 'node_modules', '.bin', 'next.cmd'),
			'next',
			'npx'
		];

		let nextCommand = 'npx';
		let args = ['next', 'dev', '-p', PORT.toString()];

		// Check if local next exists
		for (const nextPath of nextPaths.slice(0, -1)) {
			try {
				require('fs').accessSync(nextPath);
				nextCommand = nextPath;
				args = ['dev', '-p', PORT.toString()];
				break;
			} catch (e) {
				// Continue to next option
			}
		}

		console.log(`Using command: ${nextCommand} ${args.join(' ')}`);

		const devProcess = spawn(nextCommand, args, {
			stdio: 'inherit',
			shell: true,
			cwd: __dirname
		});

		devProcess.on('error', (error) => {
			console.error('Error starting dev server:', error.message);
			process.exit(1);
		});

		devProcess.on('exit', (code) => {
			console.log(`Dev server exited with code ${code}`);
			process.exit(code);
		});

		// Handle process termination
		process.on('SIGINT', () => {
			console.log('\nShutting down dev server...');
			devProcess.kill('SIGINT');
		});

		process.on('SIGTERM', () => {
			console.log('\nShutting down dev server...');
			devProcess.kill('SIGTERM');
		});

	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

startDevServer();
