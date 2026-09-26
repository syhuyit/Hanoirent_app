import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Sparkles,
  Building2,
} from "lucide-react";
import API from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu người dùng đã đăng nhập rồi, tự động chuyển hướng theo quyền
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else if (user.role === "LANDLORD") {
          navigate("/my-posts", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Gửi request đăng nhập lên Backend Spring Boot
      const response = await API.post("/auth/login", formData);

      // 2. Bóc tách token và thông tin user từ AuthResponse
      const { token, ...user } = response.data;

      // 3. Lưu token cho Axios Interceptor & lưu user cho UI
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. ĐIỀU HƯỚNG CHUẨN THỰC TẾ DỰA TRÊN QUYỀN (ROLE-BASED REDIRECTION)
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.role === "LANDLORD") {
        navigate("/my-posts", { replace: true });
      } else {
        // TENANT
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu!";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-8 group z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Hanoi
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Rent
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </span>
          <span className="text-[11px] text-zinc-400 tracking-wider uppercase font-medium">
            Social Rental Hub
          </span>
        </div>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 p-8 shadow-2xl relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Đăng nhập để khám phá và quản lý phòng trọ tiện lợi
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/30 p-3.5 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Đăng Nhập
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
          <p className="text-sm text-zinc-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-semibold transition hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
