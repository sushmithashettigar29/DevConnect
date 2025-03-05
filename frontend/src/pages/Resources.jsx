import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

function Resources() {
  const [resources, setResources] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resources/");
      console.log("Fetched resources:", response.data);
      setResources(response.data.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUserId(userId);
    }
    fetchResources();
  }, []);

  const handleDeleteResource = async (resourceId) => {
    try {
      const userId = localStorage.getItem("userId");
      console.log("Current User ID:", userId);
      if (!userId) {
        alert("You must be logged in to delete a resource.");
        return;
      }
      const response = await axios.delete(
        `http://localhost:5000/api/resources/${resourceId}`,
        {
          data: { userId },
        }
      );
      if (response.data.status === "ok") {
        fetchResources();
      }
    } catch (error) {
      console.error("Error deleting resource : ", error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Resources
      </Typography>

      {resources.length === 0 ? (
        <Typography>No resources available.</Typography>
      ) : (
        resources.map((resource) => (
          <Card key={resource._id} sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {resource.title}
              </Typography>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="success"
                  href={`http://localhost:5000${resource.fileUrl}`}
                  target="_blank" // Open in a new tab
                  download={resource.fileUrl.split("/").pop()} // Set the download filename
                >
                  Download
                </Button>
              </Box>

              {currentUserId === resource.user._id && (
                <Button
                  variant="contained"
                  color="error"
                  sx={{ ml: 2 }}
                  onClick={() => handleDeleteResource(resource._id)}
                >
                  Delete
                </Button>
              )}

              <Box display="flex" gap={1} mt={1}>
                {resource.category.map((category, index) => (
                  <Chip key={index} label={category} color="primary" />
                ))}
              </Box>

              <Typography variant="body2" mt={2}>
                Uploaded by :{" "}
                <Link
                  to={`/profile/${resource.user._id}`}
                  style={{ color: "blue", textDecoration: "none" }}
                >
                  {resource.user.name}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default Resources;
