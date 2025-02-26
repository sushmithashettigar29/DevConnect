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

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${id}`);
        setUser(res.data.user);
      } catch (error) {
        console.log("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

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

          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={() => navigate(`/edit-profile/${id}`)}
          >
            Edit Profile
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Profile;
