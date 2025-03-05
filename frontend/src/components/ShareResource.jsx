import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

function ShareResource() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState([]);
  const [file, setFile] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resources, setResources] = useState([]);

  // Fetch resources on component mount
  useEffect(() => {
    getResources();
  }, []);

  const getResources = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/resources/"
      );
      setResources(response.data.data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAddCategory = () => {
    if (newCategory && !category.includes(newCategory)) {
      setCategory([...category, newCategory]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat) => {
    setCategory(category.filter((c) => c !== cat));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadStatus("Submitting resource...");
    setUploadProgress(0);

    // Validate form inputs
    if (!title || category.length === 0 || !file) {
      setUploadStatus("Please fill all fields and upload a file.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setUploadStatus("User not logged in.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", JSON.stringify(category)); // Send categories as JSON
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resources/upload-resource",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploadStatus("Resource uploaded successfully");
      setTitle("");
      setCategory([]);
      setFile(null);
      setUploadProgress(0);

      // Refresh the list of resources
      getResources();
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  return (
    <Box p={4} maxWidth="500px">
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Share a Resource
      </Typography>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />

      <Box display="flex" alignItems="center" gap={1} mt={1}>
        <TextField
          label="Add Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleAddCategory}>
          Add
        </Button>
      </Box>

      <Box mt={2}>
        {category.map((cat, index) => (
          <Chip
            key={index}
            label={cat}
            color="primary"
            onDelete={() => handleRemoveCategory(cat)}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      <Box mt={3}>
        <input type="file" onChange={handleFileChange} required />
      </Box>

      {uploadProgress > 0 && (
        <Box mt={2}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography mt={1}>{uploadProgress}% uploaded</Typography>
        </Box>
      )}

      <Box mt={3}>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          Upload Resource
        </Button>
      </Box>

      {uploadStatus && (
        <Typography
          mt={2}
          color={uploadStatus.includes("failed") ? "red" : "green"}
        >
          {uploadStatus}
        </Typography>
      )}
    </Box>
  );
}

export default ShareResource;
