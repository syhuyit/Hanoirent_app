import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Sparkles,
  Home as HomeIcon 
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case "LANDLORD":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Building2 className="w-3 h-3" />
            Chủ trọ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <UserIcon className="w-3 h-3" />
            Người thuê
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090a0f]/80 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Hanoi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Rent</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase -mt-1">
                  Social Rental Hub
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === "/"
                    ? "bg-zinc-800/80 text-white shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                Khám phá
              </Link>

              {user?.role === "LANDLORD" && (
                <Link
                  to="/my-posts"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === "/my-posts"
                      ? "bg-amber-950/40 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-amber-400 hover:text-amber-300 hover:bg-amber-950/20"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Phòng của tôi
                </Link>
              )}

              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === "/admin"
                      ? "bg-purple-950/40 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-purple-400 hover:text-purple-300 hover:bg-purple-950/20"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Quản trị Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section / Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Create Post Button for Landlord only */}
                {user.role === "LANDLORD" && (
                  <Link
                    to="/create-post"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng bài trọ</span>
                  </Link>
                )}

                {/* User Info Capsule */}
                <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-200 shadow-inner">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-xs font-semibold text-zinc-200 line-clamp-1 max-w-[120px]">
                        {user.fullName}
                      </span>
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-zinc-300 hover:text-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-900 rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
