import { Drawer } from 'expo-router/drawer';

export default function TabsLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="Home"
        options={{
          drawerLabel: 'Home'
        }}
      />
      <Drawer.Screen
        name="Add Item"
        options={{
          drawerLabel: 'Add Item'
        }}
      />
      <Drawer.Screen
        name="Add Agent"
        options={{
          drawerLabel: 'Add Agent'
        }}
      />
      <Drawer.Screen
        name="Categories"
        options={{
          drawerLabel: 'Categories'
      }}
      />
      <Drawer.Screen
        name="Orders"
        options={{
          drawerLabel: 'Orders'
      }}
      />
      <Drawer.Screen
        name="Products"
        options={{
          drawerLabel: 'Products'
        }}
      />
      <Drawer.Screen
        name="Reviews"
        options={{
          drawerLabel: 'Reviews'
        }}
      />
      <Drawer.Screen
        name="Profile"
        options={{
          drawerLabel: 'Profile'
        }}
      />
    </Drawer>
  );
}
