import { Tabs } from 'expo-router';
import { Hop as Home, LayoutList } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { AppProvider } from '@/context/AppContext';

function TabBarIcon({ icon: Icon, focused }: { icon: typeof Home; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={20} color={focused ? '#22d3ee' : '#475569'} strokeWidth={2} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#22d3ee',
          tabBarInactiveTintColor: '#475569',
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => <View style={styles.tabBarBg} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabBarIcon icon={Home} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ focused }) => <TabBarIcon icon={LayoutList} focused={focused} />,
          }}
        />
      </Tabs>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
});
