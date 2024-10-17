import { View, Text, FlatList, ActivityIndicator, StyleSheet,TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/context';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const LeadHome = () => {
  const navigation = useNavigation(); 
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handlePressProject = (items) => {
    console.log("pr",items)
    navigation.navigate('ProjectTasksScreen', { projectId :items._id, workspaceId:items.workspace});
  };

  const fetchProjects = async () => {
    if (!user?.user?.id) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching projects for user:", user.user._id);
      const response = await axios.get(
        `http://192.168.100.209:5000/api/project/getLeadProjects/${user.user.id}`
      );
      console.log("Projects received:", response.data);
      setProjects(response.data);
    } catch (err) {
      console.error('Project fetch error:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []); 

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => {
        handlePressProject(item);
      }}
    >
    <View style={styles.projectItem}>
      <Text style={styles.projectName}>{item.name || 'Unnamed Project'}</Text>
      <Text style={styles.projectDetails}>
        {/* Tasks: {item.tasks?.length || 0} */}
      </Text>
      {item.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (projects.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noProjectsText}>No projects found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects Led by You</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  projectItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noProjectsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LeadHome;