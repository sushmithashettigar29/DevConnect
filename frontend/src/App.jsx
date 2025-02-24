import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Resources from "./pages/Resources";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  return (
    <Router>
      {isAuthenticated && <Navbar/>}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/regsiter" element={<Register />} />
        <Route
          path="/profile/:id"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
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
