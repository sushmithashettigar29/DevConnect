import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Resources from "./pages/Resources";
import EditProfile from "./pages/EditProfile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navbar setAuth={setIsAuthenticated} />}

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route
          path="/register"
          element={<Register setAuth={setIsAuthenticated} />}
        />
        <Route
          path="/profile/:id"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-profile/:id"
          element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/feed"
          element={isAuthenticated ? <Feed /> : <Navigate to="/login" />}
        />
        <Route
          path="/resources"
          element={isAuthenticated ? <Resources /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
