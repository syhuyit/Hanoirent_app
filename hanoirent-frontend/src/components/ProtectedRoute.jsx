import { Navigate } from "react-router-dom";

/**
 * Component bảo vệ đường dẫn theo quyền (Role-based Route Protection)
 * @param {ReactNode} children - Component con được bảo vệ
 * @param {Array<string>} allowedRoles - Danh sách role được phép truy cập (VD: ['ADMIN', 'LANDLORD'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem("user");
  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  // 1. Nếu chưa đăng nhập -> chuyển hướng về trang Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có yêu cầu role cụ thể mà user không có quyền
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Điều hướng về trang phù hợp với quyền của họ
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. Đã đăng nhập và đúng quyền -> hiển thị trang
  return children;
}
