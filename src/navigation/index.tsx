import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { Colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProductScreen from '../screens/ProductScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AccountScreen from '../screens/AccountScreen';
import WalletScreen from '../screens/WalletScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SupportScreen from '../screens/SupportScreen';
import SupportNewScreen from '../screens/SupportNewScreen';
import SupportDetailScreen from '../screens/SupportDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PostsScreen from '../screens/PostsScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ReferralsScreen from '../screens/ReferralsScreen';
import TransfersScreen from '../screens/TransfersScreen';
import FlashScreen from '../screens/FlashScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CartScreen from '../screens/CartScreen';

export type RootStackParamList = {
  Main: undefined;
  Product: { id: number };
  Category: { slug: string; name: string };
  SupportNew: undefined;
  SupportDetail: { id: number };
  Notifications: undefined;
  Cart: undefined;
  Wishlist: undefined;
  Referrals: undefined;
  Transfers: undefined;
  Flash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Posts: undefined;
  Orders: undefined;
  Wallet: undefined;
  Account: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Posts: '📰',
    Orders: '🛍️',
    Wallet: '💳',
    Account: '👤',
    Support: '💬',
  };
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.tabEmoji}>{icons[name] || '●'}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          title: 'الأخبار',
          tabBarIcon: ({ focused }) => <TabIcon name="Posts" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'طلباتي',
          tabBarIcon: ({ focused }) => <TabIcon name="Orders" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'المحفظة',
          tabBarIcon: ({ focused }) => <TabIcon name="Wallet" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'حسابي',
          tabBarIcon: ({ focused }) => <TabIcon name="Account" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'الدعم',
          tabBarIcon: ({ focused }) => <TabIcon name="Support" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="SupportNew" component={SupportNewScreen} />
      <Stack.Screen name="SupportDetail" component={SupportDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} />
      <Stack.Screen name="Transfers" component={TransfersScreen} />
      <Stack.Screen name="Flash" component={FlashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.pink50,
  },
  tabEmoji: {
    fontSize: 18,
  },
});
