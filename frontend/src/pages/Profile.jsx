import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography, Paper, CircularProgress } from "@mui/material";

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
        setUser(res.data);
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
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
        {user?.user?.name}
        </Typography>
        <Typography variant="body1">Email :  {user?.user?.email}</Typography>
        {user?.bio && (
          <Typography variant="body2">Bio : {user?.user?.bio}</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
