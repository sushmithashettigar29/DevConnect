import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  const response = await axios.get(
    `${API_URL}/${localStorage.getItem("userId")}`
  );
  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await axios.put(
    `${API_URL}/mark-as-read/${localStorage.getItem("userId")}`
  );
  return response.data;
};
