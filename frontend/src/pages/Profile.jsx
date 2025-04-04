import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Avatar,
  Stack,
  Link,
  Modal,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUserId = localStorage.getItem("userId");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [userList, setUserList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${id}`);
        setUser(res.data.user);

        if (currentUserId) {
          const currentUserRes = await axios.get(
            `http://localhost:5000/api/users/${currentUserId}`
          );
          const currentUser = currentUserRes.data;
          setIsFollowing(currentUser.following.includes(id));
        }
      } catch (error) {
        console.log("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, currentUserId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`);
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
  
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    if (!currentUserId) {
      console.error("Current user ID not found in localStorage");
      return;
    }

    if (currentUserId === id) {
      console.error("You cannot follow yourself.");
      return;
    }

    try {
      const endpoint = isFollowing ? `/unfollow/${id}` : `/follow/${id}`;

      setIsFollowing(!isFollowing);
      setUser((prevUser) => ({
        ...prevUser,
        followers: isFollowing
          ? prevUser.followers.filter((follower) => follower !== currentUserId)
          : [...prevUser.followers, currentUserId],
      }));

      const response = await axios.post(
        `http://localhost:5000/api/users${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const updatedCurrentUserRes = await axios.get(
        `http://localhost:5000/api/users/${currentUserId}`
      );
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedCurrentUserRes.data)
      );

      setIsFollowing(updatedCurrentUserRes.data.following.includes(id));
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      setIsFollowing(!isFollowing);
    }
  };

  const handleShowList = async (type) => {
    setModalType(type);
    setModalOpen(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${type}/${id}`
      );

      const currentUserRes = await axios.get(
        `http://localhost:5000/api/users/${currentUserId}`
      );
      const currentUser = currentUserRes.data;

      const updatedUserList = response.data.map((user) => ({
        ...user,
        isFollowing: currentUser.following.includes(user._id),
      }));

      setUserList(updatedUserList);
      console.log("Fetched Data : ", updatedUserList);
    } catch (error) {
      console.error(`Error fetching ${type}`, error);
    }
  };

  const handleFollowUnfollow = async (userId, isCurrentlyFollowing) => {
    try {
      const endpoint = isCurrentlyFollowing
        ? `/unfollow/${userId}`
        : `/follow/${userId}`;

      setUserList((prevList) =>
        prevList.map((user) =>
          user._id === userId
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );

      const response = await axios.post(
        `http://localhost:5000/api/users${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const updatedCurrentUserRes = await axios.get(
        `http://localhost:5000/api/users/${currentUserId}`
      );
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedCurrentUserRes.data)
      );
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      setUserList((prevList) =>
        prevList.map((user) =>
          user._id === userId
            ? { ...user, isFollowing: isCurrentlyFollowing }
            : user
        )
      );
    }
  };

  const handleMessageButtonClick = () => {
    if (!isFollowing) {
      alert("You must follow this user first to send a message.");
      return;
    }
    if (!currentUserId || !user?._id) {
      alert("Error fetching user details. Try again.");
      return;
    }
    navigate(`/chat/${user._id}`);
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ padding: 3, marginTop: 5, textAlign: "center" }}
      >
        <Stack alignItems="center" spacing={2}>
          <Avatar
            src={
              user?.profilePicture
                ? `http://localhost:5000${user.profilePicture}`
                : ""
            }
            alt={user?.name}
            sx={{ width: 100, height: 100 }}
          />

          <Typography variant="h4">{user?.name}</Typography>
          <Typography variant="body1">
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => handleShowList("followers")}
            >
              Followers : {user?.followers?.length || 0}
            </span>
            {" | "}
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => handleShowList("following")}
            >
              Following : {user?.following?.length || 0}
            </span>
          </Typography>
          <Typography variant="body1">Email: {user?.email}</Typography>
          {user?.bio && (
            <Typography variant="body2">Bio: {user?.bio}</Typography>
          )}
          {user?.gender && (
            <Typography variant="body2">Gender: {user?.gender}</Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
            {user?.linkedin && (
              <Link
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="contained" color="primary">
                  LinkedIn
                </Button>
              </Link>
            )}
            {user?.github && (
              <Link
                href={user.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="contained" color="secondary">
                  GitHub
                </Button>
              </Link>
            )}
            {user?.instagram && (
              <Link
                href={user.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="contained" color="error">
                  Instagram
                </Button>
              </Link>
            )}
          </Stack>

          {currentUserId !== id && (
            <Button
              variant="contained"
              color={isFollowing ? "secondary" : "primary"}
              onClick={handleFollow}
              sx={{ marginTop: 2 }}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {currentUserId !== id && (
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={handleMessageButtonClick}
              disabled={!isFollowing}
            >
              Message
            </Button>
          )}

          {currentUserId === id && (
            <Stack direction="column" spacing={2} sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/edit-profile/${id}`)}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/create-post")}
              >
                + Create Post
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/share-resource")}
              >
                + Share Resource
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            width: 400,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            margin: "auto",
            mt: 10,
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">
              {modalType === "followers" ? "Followers" : "Following"}
            </Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <List>
            {userList.map((userItem) => (
              <ListItem
                key={userItem._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={
                      `http://localhost:5000${userItem.profilePicture}` || ""
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <span
                      style={{
                        color: "blue",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(`/profile/${userItem._id}`);
                        setModalOpen(false);
                      }}
                    >
                      {userItem?.name}
                    </span>
                  }
                />

                {currentUserId !== userItem._id && (
                  <Button
                    variant="contained"
                    color={userItem.isFollowing ? "secondary" : "primary"}
                    onClick={() =>
                      handleFollowUnfollow(userItem._id, userItem.isFollowing)
                    }
                  >
                    {userItem.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Container>
  );
};

export default Profile;