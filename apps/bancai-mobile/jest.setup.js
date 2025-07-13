import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    }),
    router: {
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    },
}));

// Mock expo modules
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // The mock for `call` immediately calls the callback which is incorrect
    // So we override it with a no-op
    Reanimated.default.call = () => { };

    return {
        ...Reanimated,
        FadeInDown: {
            delay: () => ({
                springify: () => ({}),
            }),
        },
        FadeInUp: {
            delay: () => ({
                springify: () => ({}),
            }),
        },
        withSpring: jest.fn(),
        useSharedValue: jest.fn(() => ({ value: 1 })),
        useAnimatedStyle: jest.fn(() => ({})),
        createAnimatedComponent: (component) => component,
    };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: 'SafeAreaView',
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock react-native modules
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');

    return {
        ...RN,
        StatusBar: 'StatusBar',
        Pressable: 'Pressable',
        Animated: {
            ...RN.Animated,
            createAnimatedComponent: (component) => component,
        },
    };
});
