import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  UserCheck
} from "lucide-react";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "TENANT", // Mặc định là Người thuê trọ
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/auth/register", formData);
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-6 group z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Hanoi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Rent</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </span>
          <span className="text-[11px] text-zinc-400 tracking-wider uppercase font-medium">
            Social Rental Hub
          </span>
        </div>
      </Link>

      {/* Register Card */}
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 p-8 shadow-2xl relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gia nhập cộng đồng người thuê và chủ nhà thông minh tại Hà Nội
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-950/40 border border-red-500/30 p-3.5 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 flex items-start gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Bạn tham gia với tư cách là:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("TENANT")}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  formData.role === "TENANT"
                    ? "bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserIcon className={`w-4 h-4 ${formData.role === "TENANT" ? "text-blue-400" : "text-zinc-500"}`} />
                  {formData.role === "TENANT" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <span className="text-sm font-semibold mt-1">Người thuê trọ</span>
                <span className="text-[11px] text-zinc-400">Tìm kiếm & liên hệ chủ trọ</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("LANDLORD")}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  formData.role === "LANDLORD"
                    ? "bg-amber-600/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className={`w-4 h-4 ${formData.role === "LANDLORD" ? "text-amber-400" : "text-zinc-500"}`} />
                  {formData.role === "LANDLORD" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-sm font-semibold mt-1">Chủ trọ cho thuê</span>
                <span className="text-[11px] text-zinc-400">Đăng tin & quản lý phòng</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Họ và tên
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0987654321"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Mật khẩu bảo mật
            </label>
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
                Tạo Tài Khoản
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
          <p className="text-sm text-zinc-400">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
