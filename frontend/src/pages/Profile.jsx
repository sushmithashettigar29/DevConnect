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
} from "@mui/material";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false); // State to track follow status
  const currentUserId = localStorage.getItem("userId");

  // Fetch user details and check if the current user is following the profile user
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${id}`);
        setUser(res.data.user);

        // Check if the current user is following the profile user
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
  }, [id, navigate, currentUserId]); // Add currentUserId to dependency array

  // Handle follow/unfollow action
  const handleFollow = async () => {
    try {
      const endpoint = isFollowing ? `/unfollow/${id}` : `/follow/${id}`;
      const response = await axios.post(
        `http://localhost:5000/api/users${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.message) {
        setIsFollowing(!isFollowing); // Toggle follow state
        setUser((prevUser) => ({
          ...prevUser,
          followers: isFollowing
            ? prevUser.followers.filter(
                (follower) => follower !== currentUserId
              )
            : [...prevUser.followers, currentUserId],
        }));
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
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
            Followers: {user?.followers?.length || 0} | Following:{" "}
            {user?.following?.length || 0}
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

          {/* Follow/Unfollow Button */}
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

          {/* Message Button (Placeholder for now) */}
          {currentUserId !== id && (
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={() => alert("Message functionality will be added later")}
            >
              Message
            </Button>
          )}

          {/* Show buttons only if the current user is viewing their own profile */}
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
    </Container>
  );
};

export default Profile;
