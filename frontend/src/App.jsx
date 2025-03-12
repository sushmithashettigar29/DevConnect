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
import Resources from "./pages/Resources";
import EditProfile from "./pages/EditProfile";
import CreatePost from "./components/CreatePost";
import ShareResource from "./components/ShareResource";
import { io } from "socket.io-client";
import ChatPage from "./pages/ChatPage";
import ChatWindow from "./pages/ChatWindow";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleAuthChange);

    if (isAuthenticated) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      const userId = localStorage.getItem("userId");
      if (userId) {
        newSocket.emit("user-online", userId);
      }

      newSocket.on("receive-message", (message) => {
        console.log("New message received:", message);
      });

      newSocket.on("new-notification", (notification) => {
        console.log("New notification:", notification);
        setNotifications((prev) => [notification, ...prev]);
      });

      newSocket.on("notifications-read", () => {
        console.log("Notifications marked as read");
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      });

      return () => {
        window.removeEventListener("storage", handleAuthChange);
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <Router>
      {isAuthenticated && (
        <Navbar setAuth={setIsAuthenticated} notifications={notifications} />
      )}

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
          path="/resources"
          element={isAuthenticated ? <Resources /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-post"
          element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />}
        />
        <Route
          path="/share-resource"
          element={
            isAuthenticated ? <ShareResource /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:receiverId"
          element={isAuthenticated ? <ChatWindow /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
