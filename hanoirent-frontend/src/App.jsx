import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import MyPosts from "./pages/MyPosts";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang chủ công khai */}
        <Route path="/" element={<Home />} />

        {/* Luồng đăng nhập / đăng ký */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        {/* Route Quản trị: BẢO VỆ CHẶT CHẼ, CHỈ CHO PHÉP ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback điều hướng các đường dẫn không tồn tại về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
