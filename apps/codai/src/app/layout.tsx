import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Navigation from '../components/Navigation';
import { Providers } from '../components/providers';
import './globals.css';

export const metadata: Metadata = {
	title: 'Codai - Central Platform',
	description: 'AI-Driven Ecosystem Orchestration & Management Hub',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<Navigation />
					{children}
				</Providers>
			</body>
		</html>
	);
}
