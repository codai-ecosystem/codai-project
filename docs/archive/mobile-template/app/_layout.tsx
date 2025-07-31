import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Providers } from '../components/Providers';
import '../styles/global.css';

export default function RootLayout() {
    return (
        <Providers>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
            <StatusBar style="auto" />
        </Providers>
    );
}
