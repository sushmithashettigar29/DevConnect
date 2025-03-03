import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("userId", localStorage.getItem("userId"));
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/posts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating post", error);
      alert("Failed to creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Post
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ marginBottom: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create Post"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost;