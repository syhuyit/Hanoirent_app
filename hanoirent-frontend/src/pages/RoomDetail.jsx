import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  PhoneCall,
  Maximize2,
  Calendar,
  User,
  CheckCircle2,
  Zap,
  Droplet,
  ShieldCheck,
  Share2,
  Building2,
  Car,
  Dog,
  Clock,
  Sparkles,
  XCircle,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const DISTRICT_NAMES = {
  CAU_GIAY: "Cầu Giấy",
  DONG_DA: "Đống Đa",
  BA_DINH: "Ba Đình",
  HOAN_KIEM: "Hoàn Kiếm",
  TAY_HO: "Tây Hồ",
  THANH_XUAN: "Thanh Xuân",
  HAI_BA_TRUNG: "Hai Bà Trưng",
  HOANG_MAI: "Hoàng Mai",
  LONG_BIEN: "Long Biên",
  NAM_TU_LIEM: "Nam Từ Liêm",
  BAC_TU_LIEM: "Bắc Từ Liêm",
  HA_DONG: "Hà Đông",
};

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/posts/${id}`);
        if (isMounted) {
          setPost(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết bài đăng:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchPostDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-zinc-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 w-32 bg-zinc-800 rounded-xl" />
          <div className="h-96 bg-zinc-900 rounded-2xl border border-zinc-800" />
          <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-zinc-100">
        <Navbar />
        <div className="max-w-md mx-auto my-20 text-center p-8 bg-zinc-900/60 rounded-3xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-2">
            Không tìm thấy bài đăng
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Bài đăng này có thể đã bị xóa hoặc không còn tồn tại trên hệ thống.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const room = post.room || {};
  const landlord = room.landlord || {};
  const districtName =
    DISTRICT_NAMES[room.district] || room.district?.replace("_", " ");
  const images =
    room.images && room.images.length > 0
      ? room.images
      : [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
        ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết bài đăng!");
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ</span>
          </button>
        </div>

        {/* Title and Badges */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
              <MapPin className="w-3.5 h-3.5" />
              Quận {districtName}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã kiểm duyệt
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {room.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span>
              {room.address}, {room.ward}, Quận {districtName}, Hà Nội
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3 mb-8">
          <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800">
            <img
              src={images[selectedImage]}
              alt={room.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx
                      ? "border-blue-500 scale-105"
                      : "border-zinc-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Xem trước ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  Giá thuê hàng tháng
                </p>
                <p className="text-xl font-black text-amber-400">
                  {room.price?.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs text-zinc-400 font-normal">VNĐ</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400 mb-1">Diện tích phòng</p>
                <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                  <Maximize2 className="w-4 h-4 text-blue-400" />
                  <span>{room.area} m²</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-400 mb-1">Cập nhật lúc</p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                      : "Gần đây"}
                  </span>
                </div>
              </div>
            </div>

            {/* TIỆN ÍCH & QUY ĐỊNH (PHẦN MỚI THÊM) */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Tiện ích & Quy định phòng trọ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Chỗ để xe */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <Car className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">Chỗ để xe</p>
                    <p className="text-xs font-bold text-zinc-100">
                      {room.parkingSlots && room.parkingSlots > 0
                        ? `${room.parkingSlots} chỗ khả dụng`
                        : "Chưa cập nhật / Không có"}
                    </p>
                  </div>
                </div>

                {/* Sạc xe điện */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">Trạm sạc xe điện</p>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {room.hasElectricVehicleCharging ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Có hỗ trợ sạc
                        </span>
                      ) : (
                        <span className="text-zinc-500 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Không có
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Giờ giấc */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">Quy định giờ giấc</p>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {room.freeHours ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tự do 24/7
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          Có quy định giờ đóng cửa
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thú cưng */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <Dog className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">Thú cưng (Pet)</p>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {room.allowPets ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cho phép nuôi
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Không cho phép
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Utility Prices */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Chi phí dịch vụ hàng tháng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Tiền điện</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-100">
                    {room.electricityPrice
                      ? `${room.electricityPrice.toLocaleString("vi-VN")} đ/kWh`
                      : "Theo giá nhà nước"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Droplet className="w-4 h-4 text-blue-400" />
                    <span>Tiền nước</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-100">
                    {room.waterPrice
                      ? `${room.waterPrice.toLocaleString("vi-VN")} đ/m³`
                      : "Theo giá nhà nước"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-white">
                Mô tả chi tiết phòng trọ
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {room.description ||
                  "Chưa có thông tin mô tả chi tiết cho phòng trọ này."}
              </p>
            </div>
          </div>

          {/* Right Column: Landlord Card */}
          <div className="space-y-6">
            <div className="sticky top-20 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-blue-400">
                  {landlord.fullName?.charAt(0).toUpperCase() || (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {landlord.fullName || "Chủ trọ"}
                  </h4>
                  <p className="text-xs text-zinc-400">Chủ nhà đã xác thực</p>
                </div>
              </div>

              {user && user.id === landlord.id ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                  <p className="text-xs font-semibold text-amber-400">
                    Đây là bài đăng của bạn
                  </p>
                  <Link
                    to="/my-posts"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition"
                  >
                    <Building2 className="w-4 h-4" />
                    Quản lý bài đăng
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {landlord.phoneNumber || landlord.phone ? (
                    <a
                      href={`tel:${landlord.phoneNumber || landlord.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>
                        Gọi ngay: {landlord.phoneNumber || landlord.phone}
                      </span>
                    </a>
                  ) : (
                    <div className="text-center p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-500">
                      Chủ trọ chưa cập nhật số điện thoại
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 text-[11px] text-zinc-500 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Thông tin phòng trọ đã được xác thực chính chủ.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
