import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { BarChart, PieChart } from 'react-native-chart-kit';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://192.168.100.209:5000/api/user/getUsers'); // Replace with your API URL
        setUsers(response.data.users); // Access the users array directly
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const userCount = users.length;

  const workspaceCounts = users.reduce((acc, user) => {
    const workspaceCount = user.workspaces.length; // Count the number of workspaces directly
    acc[workspaceCount] = (acc[workspaceCount] || 0) + 1; // Count users with the same number of workspaces
    return acc;
  }, {});

  const workspaceLabels = Object.keys(workspaceCounts).map(Number);
  const workspaceData = Object.values(workspaceCounts);

  // Prepare Pie Chart Data
  const pieChartData = workspaceLabels.map((label, index) => ({
    name: `${label} Workspace${label > 1 ? 's' : ''}`,
    population: workspaceData[index],
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    legendFontColor: '#000', // Change to black for better visibility
    legendFontSize: 15,
  })).filter(item => item.population > 0); // Filter out items with zero population

  console.log('Pie Chart Data:', pieChartData);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', width: '100%', padding: 16 }}>
        <Text style={{ textAlign: 'center', marginVertical: 20, fontSize: 24 }}>
          Admin Dashboard - User Statistics
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={{ marginVertical: 10, fontSize: 20 }}>Total Users: {userCount}</Text>

            <Text style={{ marginVertical: 10, textAlign: 'center' }}>User Workspace Distribution (Bar Chart)</Text>
            <BarChart
              data={{
                labels: workspaceLabels.map(label => `${label} Workspace${label > 1 ? 's' : ''}`),
                datasets: [
                  {
                    data: workspaceData,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 30}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#1e2923',
                backgroundGradientFrom: '#08130d',
                backgroundGradientTo: '#1e2923',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: () => 'rgba(255, 255, 0, 1)',
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />

            <Text style={{ marginVertical: 10, textAlign: 'center' }}>User Workspace Distribution (Pie Chart)</Text>
            <PieChart
              data={pieChartData} // Use filtered pie chart data
              width={Dimensions.get('window').width - 30}
              height={220}
              chartConfig={{
                backgroundColor: '#1e2923',
                backgroundGradientFrom: '#08130d',
                backgroundGradientTo: '#1e2923',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: () => '#000', // Ensure pie chart labels are visible
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Dashboard;
