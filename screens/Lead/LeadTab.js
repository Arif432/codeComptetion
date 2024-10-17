import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LeadHome from './LeadHome';
import ProjectTasksScreen from '../ProjectTasksScreen';
import UserTasks from '../UserTasks';
import TaskDetail from '../TaskDetail';

const Tab = createBottomTabNavigator();

const LeadTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'LeadHome') {
            iconName = 'home';
          } 
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={LeadHome} />

      {/* Hide the ProjectTasksScreen from the tab bar */}
      <Tab.Screen
        name="ProjectTasksScreen"
        component={ProjectTasksScreen}
        options={{
          tabBarButton: () => null,
        }}
      />

      <Tab.Screen name="UserTasks" component={UserTasks} />

      {/* Hide the TaskDetail screen from the tab bar */}
      <Tab.Screen
        name="TaskDetail"
        component={TaskDetail}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

export default LeadTab;
