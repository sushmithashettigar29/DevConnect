import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/${localStorage.getItem("userId")}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationsAsRead = async () => {
  try {
    const userId = localStorage.getItem("userId");
    await axios.put(`${API_URL}/mark-as-read/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};
