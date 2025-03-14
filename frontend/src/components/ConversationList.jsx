import { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  Avatar,
  ListItemText,
  Typography,
} from "@mui/material";

function ConversationList({ onSelectConversation }) {
  const [followingUsers, setFollowingUsers] = useState([]); 
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      console.log("Fetching followed users...");
      try {
        // Fetch the list of users the current user is following
        const res = await axios.get(
          `http://localhost:5000/api/users/following/${userId}`
        );
        console.log("Fetched followed users:", res.data); // Debugging
        setFollowingUsers(res.data);
      } catch (error) {
        console.error("Error fetching followed users:", error);
      }
    };

    fetchFollowingUsers();
  }, [userId]);

  return (
    <div
      style={{ width: "300px", borderRight: "1px solid #ddd", padding: "10px" }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Chats
      </Typography>
      {followingUsers.length === 0 ? (
        <Typography>No followed users available</Typography>
      ) : (
        <List>
          {followingUsers.map((user) => (
            <ListItem
              button
              key={user._id}
              onClick={() => onSelectConversation(user._id)} 
            >
              <Avatar
                src={
                  user?.profilePicture
                    ? `http://localhost:5000${user.profilePicture}`
                    : ""
                }
                alt={user?.name}
                sx={{ width: 50, height: 50 }}
              />
              <ListItemText
                sx={{ marginLeft: 2 }}
                primary={user.name || "Unknown User"}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default ConversationList;
