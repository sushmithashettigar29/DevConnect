import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
} from "@mui/material";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    gender: "",
    linkedin: "",
    instagram: "",
    github: "",
    profilePicture: "", // Stores profile picture URL
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null); // Stores file object

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${id}`);
        setUserData(res.data.user);
      } catch (error) {
        console.log("Error fetching user data", error);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file); // Update state with the selected file
      await uploadProfilePicture(file); // Automatically upload the file
    }
  };

  const uploadProfilePicture = async (file) => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      const res = await axios.post(
        "http://localhost:5000/api/profile/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Send token in headers
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );

      console.log("Upload success:", res.data);
      setUserData({ ...userData, profilePicture: res.data.profilePicture });
    } catch (error) {
      console.log("Error uploading profile picture:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("profilePicture", profilePictureFile);

        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        const uploadRes = await axios.post(
          "http://localhost:5000/api/profile/upload-profile-picture",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Send token in headers
            },
            withCredentials: true,
          }
        );
        setUserData({
          ...userData,
          profilePicture: uploadRes.data.profilePicture,
        });
      }

      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      await axios.put(`http://localhost:5000/api/profile/${id}`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in headers
        },
        withCredentials: true,
      });

      navigate(`/profile/${id}`);
    } catch (error) {
      console.log("Error updating profile", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h5" gutterBottom>
          Edit Profile
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Bio"
            name="bio"
            value={userData.bio}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          {/* Gender Selection */}
          <TextField
            select
            label="Gender"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          {/* Profile Picture Upload */}
          <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
            Profile Picture
          </Typography>
          {userData.profilePicture && (
            <img
              src={`http://localhost:5000${userData.profilePicture}`}
              alt="Profile"
              width="100"
              height="100"
              style={{ borderRadius: "50%", marginBottom: "10px" }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "10px" }}
          />

          <TextField
            label="LinkedIn"
            name="linkedin"
            value={userData.linkedin}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="GitHub"
            name="github"
            value={userData.github}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Instagram"
            name="instagram"
            value={userData.instagram}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            Save Changes
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile;
