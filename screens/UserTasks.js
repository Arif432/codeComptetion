import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios'; // For making API requests
import { useUser } from '../context/context';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Ionicons } from '@expo/vector-icons'; // For adding an icon for the button

const UserTasks = () => {
  const navigation = useNavigation();
  const { user } = useUser(); // Fetch user data from context (for token)
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [loading, setLoading] = useState(true); // Loading state

  const fetchUserTasks = async () => {
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/tasks/getUserTasks`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(response.data);
      console.log("User tasks", response.data);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserTasks();
    }, [])
  );

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('TaskDetail', { task: item });
      }}
    >
      <View style={styles.taskContainer}>
        <Text style={styles.taskName}>{item?.name}</Text>
        <Text>{item.description}</Text>
        <Text>Project: {item.project?.name || 'N/A'}</Text>
        <Text>Status: {item?.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderTaskItem}
        ListEmptyComponent={<Text>No tasks assigned to you.</Text>}
      />

      {/* Floating Button for navigation to Messages screen */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          const projectId = tasks.length > 0 ? tasks[0]?.project?._id : null; // Using the project ID from the first task
          if (projectId) {
            console.log("projec",projectId)
            navigation.navigate('Messages', { projectId }); // Pass projectId to Messages screen
          } else {
            alert('No project ID available.');
          }
        }}
      >
        <Ionicons name="chatbox" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  taskContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  taskName: {
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
});

export default UserTasks;
