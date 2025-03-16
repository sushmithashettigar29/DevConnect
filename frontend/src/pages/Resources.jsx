import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid
} from "@mui/material";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter } from "react-icons/fa";

function Resources() {
  const [resources, setResources] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/resources/", {
        params: {
          search: searchQuery,
          sort: sortOrder,
        },
      });
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
  }, [searchQuery, sortOrder]);

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
    <Grid
    container
    spacing={2}
    justifyContent="center"
    alignItems="center"
    display="flex"
    flexDirection="column"
    sx={{ marginTop: 2, px: 2 }}
  >
    <Grid
      item
      sx={{
        minWidth: "450px",
        maxWidth: "750px",
        width: "100%",
        marginBottom: 3,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        sx={{
          backgroundColor: "#543A14",
          p: 2,
          textAlign: "center",
          color: "#F0BB78",
        }}
      >
        RESOURCES
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by username, title, or category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaSearch />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
              >
                <FaFilter className="text-gray-600" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {resources.length === 0 ? (
        <Typography>No resources available.</Typography>
      ) : (
        resources.map((resource) => (
          <Card key={resource._id} sx={{ mb: 3, p: 2 ,backgroundColor: "#FFF0DC",}}>
            <CardContent>
              {/* Title and Download Button in the same line */}
              <Grid container alignItems="center" justifyContent="space-between">
                {/* Title on the left */}
                <Grid item>
                  <Typography variant="h6" fontWeight="bold">
                    {resource.title}
                  </Typography>
                </Grid>

                {/* Download Button on the right */}
                <Grid item>
                  <Button
                    variant="contained"
                    color="success" sx={{backgroundColor:"#543A14"}}
                    href={`http://localhost:5000${resource.fileUrl}`}
                    target="_blank"
                    download={resource.fileUrl.split("/").pop()}
                  >
                    Download
                  </Button>
                </Grid>
              </Grid>

              {/* Delete Button (only for the owner) */}
              {currentUserId === resource.user._id && (
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={() => handleDeleteResource(resource._id)}
                >
                  Delete
                </Button>
              )}

              {/* Categories */}
              <Box display="flex" gap={1} mt={2}>
                {resource.category.map((category, index) => (
                  <Chip key={index} label={category} color="#FFF0DC" />
                ))}
              </Box>

              {/* Uploaded by */}
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
    </Grid>
  </Grid>
  );
}

export default Resources;
