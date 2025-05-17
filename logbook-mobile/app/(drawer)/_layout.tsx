import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';

// Custom drawer content component
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  
  // Ensure we use the theme correctly
  const theme = colorScheme;
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors[theme].card 
    }}>
      {/* Header with user info */}
      <View style={[
        styles.drawerHeader, 
        { 
          backgroundColor: Colors[theme].primary,
          paddingTop: insets.top || 20 
        }
      ]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <ThemedText style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <ThemedText style={styles.username}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'User'}
          </ThemedText>
          <ThemedText style={styles.email}>
            {user?.email || ''}
          </ThemedText>
        </View>
      </View>
      
      {/* Drawer items */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 0 }}
        style={{ backgroundColor: Colors[theme].card }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      {/* Footer with logout */}
      <View style={[
        styles.drawerFooter,
        { 
          borderTopColor: Colors[theme].border,
          backgroundColor: Colors[theme].card,
          paddingBottom: insets.bottom || 20
        }
      ]}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <IconSymbol name="arrow.right.square" size={22} color={isDark ? '#fff' : '#333'} />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="home"
      screenOptions={({navigation}) => {
        const theme = colorScheme === 'dark' ? 'dark' : 'light';
        return {
          // This is the MAIN header shown at the top of all screens
          headerShown: true, 
          headerStyle: {
            backgroundColor: Colors[theme].card,
            borderBottomColor: Colors[theme].border,
            borderBottomWidth: 1,
          },
          headerTintColor: Colors[theme].text,
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                // Ensure this properly opens the drawer
                try {
                  navigation.toggleDrawer();
                } catch (error) {
                  console.log('Error toggling drawer:', error);
                  // Fallback approach
                  navigation.openDrawer();
                }
              }}
            >
              <IconSymbol 
                name="line.3.horizontal" 
                size={24} 
                color={tintColor || Colors[theme].text} 
              />
            </TouchableOpacity>
          ),
          drawerActiveTintColor: Colors[theme].primary,
          drawerActiveBackgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)',
          drawerInactiveTintColor: Colors[theme].text,
          drawerStyle: {
            backgroundColor: Colors[theme].card,
            width: 280,
          },
          sceneContainerStyle: {
            backgroundColor: Colors[theme].background
          },
          drawerType: 'front',
          swipeEdgeWidth: 100,
          overlayColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
        };
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Dashboard',
          drawerIcon: ({ color }) => <IconSymbol name="house.fill" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Finance',
          headerTitle: 'Finance',
          drawerIcon: ({ color }) => <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerTitle: 'Workout',
          drawerIcon: ({ color }) => <IconSymbol name="figure.run" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          drawerIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 16,
    padding: 4,
  },
  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  userInfo: {
    marginTop: 10,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
  },
}); 