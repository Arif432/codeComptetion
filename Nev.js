import React from 'react';
import Login from './screens/AuthScreens/Login';
import SignupScreen from './screens/AuthScreens/Signup';
import ProjectScreen from './screens/ProjectScreen';
import TabNavigator from './TabNavigator';
import LeadHome from "./screens/Lead/LeadHome";
import { useUser } from './context/context';
import { createStackNavigator } from '@react-navigation/stack';
import UserTasks from './screens/UserTasks';
import LeadTab from './screens/Lead/LeadTab';
import Messages from './Messages';

const Stack = createStackNavigator();

const Nev = () => {
    const { user } = useUser();
    console.log("Current User:", user); // Debugging line

    return (
      <Stack.Navigator>
          {!user ? ( // Check if user is null
            <>
              <Stack.Screen 
                name="Login" 
                component={Login} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen} 
                options={{ headerShown: false }} 
              />
            </>
          ) : (
            <>
              {user.user.role === 'admin' && ( // Accessing role correctly
                <>
                  <Stack.Screen 
                    name="MainApp" 
                    component={TabNavigator} 
                  />
                  
                </>
              )}
              {user.user.role === 'team_member' && ( 
                <>
                  <Stack.Screen 
                    name="LeadTab" 
                    component={LeadTab} 
                    options={{ headerShown: false }} 
                  />
                </>
              )}
            </>
          )}

<Stack.Screen 
        name="Messages" 
        component={Messages} 
        options={{ headerShown: true, title: 'Messages' }} 
      />
      </Stack.Navigator>
    );
};

export default Nev;
