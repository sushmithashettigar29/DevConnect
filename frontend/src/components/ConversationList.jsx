import { List, ListItem, ListItemText, Typography } from "@mui/material";

function ConversationList({ conversations, onSelectConversation }) {
  return (
    <List>
      {conversations.map((conversation) => (
        <ListItem
          button
          key={conversation.user._id}
          onClick={() => onSelectConversation(conversation.user._id)}
        >
          <ListItemText
            primary={conversation.user.name}
            secondary={
              <>
                <Typography variant="body2" color="textSecondary">
                  {conversation.lastMessage}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default ConversationList;
