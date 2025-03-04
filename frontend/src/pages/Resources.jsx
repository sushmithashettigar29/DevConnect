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
import ShareResource from "../components/ShareResource";

function Resources() {
  const [resources, setResources] = useState([]);

  const fetchResources = () => {
    axios
      .get("http://localhost:5000/api/resources")
      .then((res) => {
        console.log("Fetched resources:", res.data);
        setResources(res.data);
      })
      .catch((err) => console.error("Error fetching resources:", err));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Resources
      </Typography>

      <ShareResource onResourceUpload={fetchResources} />

      {resources.length === 0 ? (
        <Typography>No resources available.</Typography>
      ) : (
        resources.map((resource) => (
          <Card key={resource._id} sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {resource.title}
              </Typography>

              <Box display="flex" gap={1} mt={1}>
                {resource.category.map((category, index) => (
                  <Chip key={index} label={category} color="primary" />
                ))}
              </Box>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="success"
                  href={`http://localhost:5000${resource.fileUrl}`}
                  download
                >
                  Download
                </Button>
              </Box>

              <Typography variant="body2" mt={2}>
                Uploaded by{" "}
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
