import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button,Alert } from 'react-native';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import { useUser } from '../context/context';

const HomeScreen = ({ navigation }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { user } = useUser();
    console.log("user",user)
    // Fetch all workspaces
    
    const fetchWorkspaces = async () => {
        try {
            const response = await axios.get('http://192.168.100.209:5000/api/workspace/getAllWorkSpace', {
                headers: {Authorization: `Bearer ${user.token}`}, // Include the token here},
            });
            setWorkspaces(response.data);
            console.log("wordk",response.data)
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        }
    };
    
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://192.168.100.209:5000/api/user/getUsers');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
        fetchUsers();
    }, []);

    const renderWorkspaceItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                console.log("work spece", item._id),

                navigation.navigate('Projects',
                 { 
                workspaceId: item._id 
                })}}>
            <Text style={styles.cardTitle}>{item.name}</Text>
        </TouchableOpacity>
    );

    const handleCreateWorkspace = async () => {
        if (!workspaceName.trim()) return;
    
        const newWorkspace = {
            name: workspaceName,
            admin: user.user.id
        };
    
        console.log("Creating workspace:", newWorkspace);
    
        try {
            // Create the workspace
            const response = await axios.post(
                'http://192.168.100.209:5000/api/workspace/createWorkSpace',
                newWorkspace,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }
            );
    
            const createdWorkspace = response.data;
            console.log("Workspace created:", createdWorkspace);
    
            // Update workspaces state
            setWorkspaces(prevWorkspaces => [...prevWorkspaces, createdWorkspace]);
    
            // Add users if any are selected
            if (selectedUsers.length > 0) {
                console.log("Adding users:", selectedUsers);
    
                try {
                    // Send all users at once
                    const addUsersResponse = await axios.post(
                        'http://192.168.100.209:5000/api/workspace/addUser',
                        {
                            workspaceId: createdWorkspace._id,
                            userIds: selectedUsers  // Send array of userIds
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${user.token}`,
                            }
                        }
                    );
    
                    console.log("Users added:", addUsersResponse.data);
    
                } catch (error) {
                    console.error('Error adding users:', error.response?.data || error);
                    Alert.alert(
                        'Error',
                        error.response?.data?.error || 'Failed to add users to workspace'
                    );
                }
            }
    
            // Reset form state
            setModalVisible(false);
            setWorkspaceName('');
            setSelectedUsers([]);
    
            // Show success message
            Alert.alert('Success', 'Workspace created successfully');
    
        } catch (error) {
            console.error('Error creating workspace:', error.response?.data || error);
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to create workspace'
            );
        }
    };

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const renderSelectedUsers = () => {
        return selectedUsers.map(userId => {
            const user = users.find(u => u._id === userId);
            return (
                <View key={userId} style={styles.tag}>
                    <Text style={styles.tagText}>{user.name}</Text>
                    <TouchableOpacity onPress={() => toggleUserSelection(userId)}>
                        <Text style={styles.removeTag}>x</Text>
                    </TouchableOpacity>
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Workspaces</Text>
            <FlatList
                data={workspaces}
                renderItem={renderWorkspaceItem}
                keyExtractor={(item) => item._id?.toString()}
            />

            <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
                <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>

            {/* Modal for creating workspace */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create Workspace</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Workspace Name"
                        value={workspaceName}
                        onChangeText={setWorkspaceName}
                    />

                    <Text style={styles.label}>Select Users:</Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.dropdown}>
                        <Text style={styles.dropdownText}>
                            {selectedUsers.length > 0 ? `${selectedUsers.length} users selected` : 'Select Users'}
                        </Text>
                    </TouchableOpacity>

                    {dropdownVisible && (
                        <View style={styles.dropdownList}>
                            {users.map(user => (
                                <TouchableOpacity key={user._id} style={styles.dropdownItem} onPress={() => toggleUserSelection(user._id)}>
                                    <Text style={styles.dropdownItemText}>{user.name}</Text>
                                    {selectedUsers.includes(user._id) && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.selectedUsersContainer}>
                        {renderSelectedUsers()}
                    </View>

                    <Button title="Create Workspace" onPress={handleCreateWorkspace} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                </View>
            </Modal>
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
    card: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        width: '80%',
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: 'white',
    },
    dropdown: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
        width: '80%',
        marginBottom: 20,
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: 'black',
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
        color: 'black',
    },
    checkmark: {
        fontSize: 16,
        color: 'green',
    },
    selectedUsersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#007bff',
        borderRadius: 15,
        padding: 5,
        margin: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        color: 'white',
        marginRight: 5,
    },
    removeTag: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
