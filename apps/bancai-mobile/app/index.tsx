import { useRouter } from 'expo-router'
import { ScrollView, View, Text, Pressable, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  withSpring, 
  useSharedValue, 
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const features = [
  {
    icon: 'bulb-outline' as const,
    title: 'AI-Powered',
    description: 'Advanced intelligence with real-time processing',
    color: ['#3B82F6', '#1D4ED8'],
    delay: 0.1
  },
  {
    icon: 'flash-outline' as const,
    title: 'Lightning Fast',
    description: 'Optimized performance and edge computing',
    color: ['#F59E0B', '#D97706'],
    delay: 0.2
  },
  {
    icon: 'shield-outline' as const,
    title: 'Secure',
    description: 'Bank-grade security and encryption',
    color: ['#10B981', '#059669'],
    delay: 0.3
  },
  {
    icon: 'globe-outline' as const,
    title: 'Global Scale',
    description: 'Worldwide infrastructure with 99.99% uptime',
    color: ['#8B5CF6', '#7C3AED'],
    delay: 0.4
  }
]

const stats = [
  { value: '1M+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50ms', label: 'Response' },
  { value: '24/7', label: 'Support' }
]

export default function HomePage() {
  const router = useRouter()
  const scale = useSharedValue(1)

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(feature.delay * 1000).springify()}
      className="mb-4"
    >
      <LinearGradient
        colors={[...feature.color, feature.color[0] + '20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-6 shadow-lg"
      >
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
            <Ionicons name={feature.icon} size={24} color="white" />
          </View>
          <Text className="text-white text-xl font-bold flex-1">{feature.title}</Text>
        </View>
        <Text className="text-white/90 text-base leading-6">{feature.description}</Text>
      </LinearGradient>
    </Animated.View>
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <LinearGradient
        colors={['#1E293B', '#0F172A', '#020617']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <ScrollView 
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Header */}
            <Animated.View 
              entering={FadeInUp.delay(200).springify()}
              className="pt-8 pb-6"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white/70 text-base">Welcome to</Text>
                  <Text className="text-white text-3xl font-bold">CODAI Mobile</Text>
                </View>
                <Pressable className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
                  <Ionicons name="notifications-outline" size={24} color="white" />
                </Pressable>
              </View>
              
              <View className="bg-blue-500/20 rounded-2xl p-4 border border-blue-500/30">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={20} color="#3B82F6" />
                  <Text className="text-blue-200 ml-2 font-medium">
                    CODAI Ecosystem Template - Mobile Edition
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Hero Section */}
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              className="mb-8"
            >
              <Text className="text-white text-4xl font-bold text-center mb-4 leading-tight">
                Build the Future with{' '}
                <Text className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  AI-Powered
                </Text>
                {' '}Mobile Apps
              </Text>
              
              <Text className="text-white/80 text-lg text-center leading-7 mb-8">
                A comprehensive ecosystem of interconnected AI tools, 
                designed for enterprise scale and mobile excellence.
              </Text>
              
              <AnimatedPressable
                style={animatedButtonStyle}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push('/dashboard')}
                className="mb-4"
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  className="rounded-2xl py-4 px-8 shadow-lg"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white text-lg font-bold mr-2">Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </LinearGradient>
              </AnimatedPressable>
              
              <Pressable 
                onPress={() => router.push('/learn-more')}
                className="border border-white/30 rounded-2xl py-4 px-8"
              >
                <Text className="text-white text-lg font-semibold text-center">Learn More</Text>
              </Pressable>
            </Animated.View>

            {/* Stats Section */}
            <Animated.View 
              entering={FadeInUp.delay(600).springify()}
              className="mb-8"
            >
              <View className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <View className="flex-row flex-wrap justify-between">
                  {stats.map((stat, index) => (
                    <Animated.View 
                      key={index}
                      entering={FadeInDown.delay((index + 1) * 100).springify()}
                      className="w-1/2 items-center mb-4"
                    >
                      <Text className="text-white text-2xl font-bold">{stat.value}</Text>
                      <Text className="text-white/70 text-sm">{stat.label}</Text>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Features Section */}
            <Animated.View 
              entering={FadeInUp.delay(800).springify()}
              className="mb-8"
            >
              <Text className="text-white text-2xl font-bold text-center mb-6">
                Powerful Features for Mobile
              </Text>
              
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View 
              entering={FadeInUp.delay(1000).springify()}
              className="mb-8"
            >
              <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
              
              <View className="flex-row space-x-4 mb-4">
                <Pressable 
                  onPress={() => router.push('/analytics')}
                  className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <Ionicons name="analytics-outline" size={24} color="white" className="mb-2" />
                  <Text className="text-white font-medium">Analytics</Text>
                  <Text className="text-white/70 text-sm">View insights</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => router.push('/settings')}
                  className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <Ionicons name="settings-outline" size={24} color="white" className="mb-2" />
                  <Text className="text-white font-medium">Settings</Text>
                  <Text className="text-white/70 text-sm">Customize app</Text>
                </Pressable>
              </View>
              
              <View className="flex-row space-x-4">
                <Pressable 
                  onPress={() => router.push('/help')}
                  className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <Ionicons name="help-circle-outline" size={24} color="white" className="mb-2" />
                  <Text className="text-white font-medium">Help</Text>
                  <Text className="text-white/70 text-sm">Get support</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => router.push('/profile')}
                  className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <Ionicons name="person-outline" size={24} color="white" className="mb-2" />
                  <Text className="text-white font-medium">Profile</Text>
                  <Text className="text-white/70 text-sm">Your account</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}
