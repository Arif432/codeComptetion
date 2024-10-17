import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useUser } from '../context/context';

const ProjectTasksScreen = ({ route }) => {
  const { projectId,workspaceId } = route.params; 
  console.log("proj,work",projectId,workspaceId)
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchTasks = async () => {
    console.log("fetchh tes",projectId)
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/tasks/getTasks/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(response.data);
      console.log("tesks",response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/user/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(response.data.users);
      console.log("response.data.users", response.data.users); 
    } catch (error) {
      console.error('Error fetching users:', error); 
    }
  };
  
  const createTask = async () => {
    console.log("Creating task for assignee:", assignee._id);
    try {
      await axios.post(`http://192.168.100.209:5000/api/tasks/createTask`, {
        projectId,         
        taskName, 
        assigneeId: assignee._id ,
        description:"dummy"
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      setModalVisible(false);  
      fetchTasks();           
    } catch (error) {
      console.error('Error creating task:', error);  // Log error if something goes wrong
    }
  };
  

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId]);

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item?.name}</Text>
      <Text style={styles.taskAssignee}>Assigned to: {item.assignee?.name}</Text>
    </View>
  );

  if (loading) {
    return <View><Text>Loading tasks...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks for Project</Text>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item._id.toString()}
      />

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Create New Task</Text>
            <TextInput
              placeholder="Task Name"
              value={taskName}
              onChangeText={setTaskName}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
              <Text>Select Assignee</Text>
            </TouchableOpacity>

            {dropdownVisible && (
              <View>
                {users.map(user => (
                  <TouchableOpacity key={user._id} onPress={() => setAssignee(user)}>
                    <Text>{user?.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Button title="Create Task" onPress={createTask} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Text>+ Create Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  taskCard: { padding: 10, backgroundColor: '#f1f1f1', marginBottom: 10 },
  taskTitle: { fontSize: 18 },
  taskAssignee: { fontSize: 14 },
  floatingButton: { position: 'absolute',textDecorationColor:"white", bottom: 20, right: 20, padding: 15, backgroundColor: 'blue', borderRadius: 50 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, backgroundColor: 'white', borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 }
});

export default ProjectTasksScreen;
