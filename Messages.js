import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useUser } from "./context/context";
import { useRoute } from "@react-navigation/native";

const Messages = () => {
  const { user } = useUser();
  const scrollViewRef = useRef();
  const [messages, setMessages] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const route = useRoute();
  const { projectId } = route.params;

  useEffect(() => {
    handleFetchMessages(projectId);
  }, [projectId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleFetchMessages = async (projectId) => {
    try {
      const response = await axios.get(`http://192.168.100.209:5000/api/messages/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      // Log the entire response data to see its structure
      console.log("API Response:", response.data);
  
      // Check if the response has messages and is an array
      if (!Array.isArray(response.data) || response.data.length === 0) {
        console.error("No projects found or invalid response");
        return;
      }
      const structuredMessages = response.data.map((msg) => ({
        id: msg._doc._id.toString(), // Convert ObjectId to string
        content: msg._doc.content,
        sender: msg.sender.name, 
        timestamp: msg._doc.timestamp, 
      }));
  
      console.log("Fetched messages:", structuredMessages);
      setMessages(structuredMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  
  const handleSendMessage = async () => {
    try {
      const response = await axios.post(`http://192.168.100.209:5000/api/messages/send/${projectId}`, {
        text: message,
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`, // Add your auth token here
          'Content-Type': 'application/json'
        }
      });

      console.log('Message sent:', response.data.message);
      // Add the new message to the messages state
      addMessage({
        id: response.data.message._id, // Make sure the response has the new message ID
        content: message,
        sender: user.name, // You may want to get the sender's name from user context
        timestamp: new Date().toISOString(), // Use the current time
      });

      setMessage(''); // Clear the input after sending
    } catch (err) {
      console.error('Error sending message:', err);
      // Handle error setting if needed
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => (
          <Text key={msg.id} style={styles.messageText}>
            {msg.sender}: {msg.content}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={message}
          onChangeText={setMessage}
        />
        <Text onPress={handleSendMessage} style={styles.sendButton}>
          Send
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageText: {
    marginBottom: 10,
    fontSize: 16,
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  sendButton: {
    paddingHorizontal: 15,
    color: "blue",
    alignSelf: "center",
  },
});

export default Messages;
