import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Chat from "./Chat";

const ChatPage = () => {
  const { receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    console.log("Fetching messages for:", receiverId);
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, user not authenticated.");
        }

        const response = await fetch(
          `http://localhost:5000/api/messages/${receiverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [receiverId]);

  const handleSendMessage = async (messageContent) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated.");
      }

      const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender: currentUserId,
          receiver: receiverId,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <p>Loading chat...</p>;

  return (
    <Chat
      messages={messages}
      onSendMessage={handleSendMessage}
      userId={currentUserId}
    />
  );
};

export default ChatPage;
