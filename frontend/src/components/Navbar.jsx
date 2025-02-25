import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuth(false);
    navigate("/login");
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          DevConnect
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate("/feed")}>
            Feed
          </Button>
          <Button color="inherit" onClick={() => navigate("/resources")}>
            Resources
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate(`/profile/${userId}`)}
          >
            Profile
          </Button>
        </Box>

        <Button color="error" onClick={handleLogout} sx={{ marginLeft: 2 }}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  setAuth: PropTypes.func.isRequired,
};
export default Navbar;
