import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useUser } from '../context/context';

const ProjectScreen = ({ route }) => {
  const { workspaceId } = route.params;
  console.log("wor",workspaceId) 

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [users, setUsers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const { user } = useUser(); 

  const handleUserSelection = (user) => {
    setSelectedUser(user); // Set the selected user
    setDropdownVisible(false); // Close the dropdown after selection
  };

  // Fetch projects for the specific workspace
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/project/getProjects/${workspaceId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProjects(response.data);
      console.log("res",response.data)
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users in the workspace for selecting team leads
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/user/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(response.data.users);
      console.log("user fetch beck",response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Create a new project
  const createProject = async () => {
    console.log("Creting",workspaceId,projectName,selectedUser._id)
    try {
      await axios.post(`http://192.168.100.209:5000/api/project/createProject`, {
        workspaceId,
        projectName,
        teamLeadId: selectedUser._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setModalVisible(false);
      fetchProjects(); // Refresh the projects list after creation
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers(); 
    console.log("recel")
  }, [workspaceId]);

  const renderProjectItem = ({ item }) => (
    <View style={styles.projectCard}>
      <Text style={styles.projectTitle}>{item.name}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item._id?.toString()}
      />

      {/* Create Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TextInput
              placeholder="Project Name"
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
            />

            <Text style={styles.label}>Select Users:</Text>
            <TouchableOpacity 
              onPress={() => setDropdownVisible(!dropdownVisible)} 
              style={styles.dropdown}
            >
         <Text style={styles.dropdownText}>
  {selectedUser ? selectedUser.name : 'Select Lead'}
</Text>
</TouchableOpacity>

{dropdownVisible && (
  <View style={styles.dropdownList}>
    {users.map(user => (
      <TouchableOpacity 
        key={user._id} 
        style={styles.dropdownItem} 
        onPress={() => handleUserSelection(user)}
      >
        <Text style={styles.dropdownItemText}>{user.name}</Text>
        {selectedUser && selectedUser._id === user._id && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    ))}
  </View>
)}

            <Button title="Create" onPress={createProject} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Button to open the modal */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.floatingButtonText}>+ Create Project</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  projectCard: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dropdown: {
    marginBottom: 10,
  },
  dropdownText: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownList: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    width: '80%',
    maxHeight: 200,
    overflow: 'scroll',
    position: 'absolute',
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  checkmark: {
    color: 'green',
  },
});

export default ProjectScreen;
