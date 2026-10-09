import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import RoomDetail from "./pages/RoomDetail";
import AdminDashboard from "./pages/AdminDashboard";
import MyPosts from "./pages/MyPosts";
import UpdatePost from "./pages/UpdatePost";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatProvider } from "./context/ChatContext";

export default function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          {/* Các trang công khai */}
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/posts/:id" element={<RoomDetail />} />

          {/* Luồng đăng nhập / đăng ký */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Trang Tin nhắn & Chat trực tuyến (Yêu cầu đăng nhập) */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Route Quản lý bài đăng của Chủ trọ */}
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute allowedRoles={["LANDLORD"]}>
                <MyPosts />
              </ProtectedRoute>
            }
          />

          {/* Route tạo bài đăng: Chỉ cho phép LANDLORD */}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute allowedRoles={["LANDLORD"]}>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          {/* Route Quản trị: CHỈ CHO PHÉP ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route cập nhật bài đăng: Chỉ cho phép LANDLORD */}
          <Route
            path="/update-post/:id"
            element={
              <ProtectedRoute allowedRoles={["LANDLORD"]}>
                <UpdatePost />
              </ProtectedRoute>
            }
          />

          {/* Fallback điều hướng các đường dẫn không tồn tại về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}
