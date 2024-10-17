import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { useUser } from '../context/context';

const TaskDetail = ({ route, navigation }) => {
  const { user } = useUser();
  const { task } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timerActive, setTimerActive] = useState(false); 
  console.log("user",task)

  const handleStartTimer = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await axios.post(
        `http://192.168.100.209:5000/api/tasks/${task._id}/timer/start`,{},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setTimerActive(true);
      console.log('Timer started:', response.data);
    } catch (error) {
      console.error('Error starting timer:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to start timer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `http://192.168.100.209:5000/api/tasks/${task._id}/timer/stop`,{}, 
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setTimerActive(false);
      console.log('Timer stopped:', response.data);
    } catch (error) {
      console.error('Error stopping timer:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to stop timer.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>{task.name}</Text>
      <Text style={styles.description}>{task.description}</Text>
      <Text style={styles.info}>Project: {task.project?.name || 'N/A'}</Text>
      <Text style={styles.info}>Status: {task.status}</Text>
      <Text style={styles.info}>Time Spent: {task.timeSpent} minutes</Text>
      <Button title="Start Timer" onPress={handleStartTimer} />
      <Button title="Stop Timer" onPress={handleStopTimer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    fontSize: 16,
  },
});

export default TaskDetail;
