import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/context';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useUser(); 

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Please fill in all fields');
            return;
        }
        
        try {
            // Login request
            const response = await axios.post('http://192.168.100.209:5000/api/auth/login', {
                email,
                password
            });
            
            const userData = response.data;
            setUser(userData);
            
            if (userData.user.role === 'admin') {
                navigation.replace('MainApp');
                return;
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            Alert.alert('Login failed', 'Invalid email or password.');
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.signupPrompt}>
                Don't have an account?{' '}
                <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate('Signup')}
                >
                    Sign up
                </Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    signupPrompt: {
        marginTop: 20,
        textAlign: 'center',
    },
    signupLink: {
        color: 'blue',
    },
});

export default Login;
