import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Maximize2,
  PhoneCall,
  Building2,
  Filter,
  Search,
  CheckCircle2,
  Eye,
  Camera,
  RotateCcw,
  SlidersHorizontal,
  X,
  ShieldAlert,
  HelpCircle,
  Mail,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_NAMES,
  DISTRICTS,
  DISTRICT_NAMES,
  PRICE_RANGES,
} from "../constants/roomConstants";

const INITIAL_FILTERS = {
  propertyType: "",
  district: "",
  ward: "",
  minPrice: "",
  maxPrice: "",
  priceRangeIndex: 0,
  maxElectricityPrice: "",
  maxWaterPrice: "",
  maxInternetPrice: "",
  minParkingSlots: "",
  hasElectricVehicleCharging: false,
  allowPets: false,
  freeHours: false,
  airConditioner: false,
  waterHeater: false,
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.district) count++;
    if (filters.ward?.trim()) count++;
    if (filters.minPrice || filters.maxPrice || filters.priceRangeIndex > 0)
      count++;
    if (filters.maxElectricityPrice) count++;
    if (filters.maxWaterPrice) count++;
    if (filters.maxInternetPrice) count++;
    if (filters.minParkingSlots && Number(filters.minParkingSlots) > 0) count++;
    if (filters.hasElectricVehicleCharging) count++;
    if (filters.allowPets) count++;
    if (filters.freeHours) count++;
    if (filters.airConditioner) count++;
    if (filters.waterHeater) count++;
    return count;
  }, [filters]);

  // Fetch posts from backend with search criteria
  const fetchPosts = useCallback(
    async (pageToLoad = 0, currentFilters = filters) => {
      setLoading(true);
      try {
        const params = {
          page: pageToLoad,
          size: 12,
        };

        if (currentFilters.propertyType)
          params.propertyType = currentFilters.propertyType;
        if (currentFilters.district) params.district = currentFilters.district;
        if (currentFilters.ward?.trim())
          params.ward = currentFilters.ward.trim();
        if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
        if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
        if (currentFilters.maxElectricityPrice)
          params.maxElectricityPrice = currentFilters.maxElectricityPrice;
        if (currentFilters.maxWaterPrice)
          params.maxWaterPrice = currentFilters.maxWaterPrice;
        if (currentFilters.maxInternetPrice)
          params.maxInternetPrice = currentFilters.maxInternetPrice;
        if (
          currentFilters.minParkingSlots &&
          Number(currentFilters.minParkingSlots) > 0
        ) {
          params.minParkingSlots = currentFilters.minParkingSlots;
        }
        if (currentFilters.hasElectricVehicleCharging)
          params.hasElectricVehicleCharging = true;
        if (currentFilters.allowPets) params.allowPets = true;
        if (currentFilters.freeHours) params.freeHours = true;
        if (currentFilters.airConditioner) params.airConditioner = true;
        if (currentFilters.waterHeater) params.waterHeater = true;

        const res = await API.get("/posts/search", { params });

        if (res.data && Array.isArray(res.data.content)) {
          setPosts(res.data.content);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
          setCurrentPage(res.data.number || 0);
        } else if (Array.isArray(res.data)) {
          setPosts(res.data);
          setTotalPages(1);
          setTotalElements(res.data.length);
          setCurrentPage(0);
        }
      } catch (err) {
        console.error("Lỗi khi tìm kiếm bài đăng:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Load initially
  useEffect(() => {
    let ignore = false;
    API.get("/posts/search", { params: { page: 0, size: 12 } })
      .then((res) => {
        if (!ignore && res.data) {
          if (Array.isArray(res.data.content)) {
            setPosts(res.data.content);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
            setCurrentPage(res.data.number || 0);
          } else if (Array.isArray(res.data)) {
            setPosts(res.data);
            setTotalPages(1);
            setTotalElements(res.data.length);
            setCurrentPage(0);
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải bài đăng ban đầu:", err);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handlePricePreset = (index) => {
    const range = PRICE_RANGES[index];
    setFilters((prev) => ({
      ...prev,
      priceRangeIndex: index,
      minPrice: range.min || "",
      maxPrice: range.max || "",
    }));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(0);
    fetchPosts(0, filters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(0);
    fetchPosts(0, INITIAL_FILTERS);
  };

  const handleRemoveFilter = (filterKey) => {
    let updated;
    if (filterKey === "price") {
      updated = { ...filters, minPrice: "", maxPrice: "", priceRangeIndex: 0 };
    } else if (typeof filters[filterKey] === "boolean") {
      updated = { ...filters, [filterKey]: false };
    } else {
      updated = { ...filters, [filterKey]: "" };
    }
    setFilters(updated);
    setCurrentPage(0);
    fetchPosts(0, updated);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    fetchPosts(newPage, filters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Main Container chia 3 cột */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= CỘT TRÁI: BỘ LỌC TÌM KIẾM CỐ ĐỊNH (3 Cột) ================= */}
          <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-4 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <span>Bộ lọc tìm kiếm</span>
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                {/* Loại hình phòng */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Loại hình phòng
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => {
                      const updated = {
                        ...filters,
                        propertyType: e.target.value,
                      };
                      setFilters(updated);
                      fetchPosts(0, updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Tất cả loại hình</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quận / Huyện */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    Quận / Huyện
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) => {
                      const updated = { ...filters, district: e.target.value };
                      setFilters(updated);
                      fetchPosts(0, updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Tất cả Quận / Huyện</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.code} value={d.code}>
                        Quận {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Xã / Phường */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    Xã / Phường
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.ward}
                      onChange={(e) =>
                        setFilters({ ...filters, ward: e.target.value })
                      }
                      placeholder="VD: Dịch Vọng..."
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                    />
                    {filters.ward && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...filters, ward: "" };
                          setFilters(updated);
                          fetchPosts(0, updated);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Khoảng giá */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    Khoảng giá thuê
                  </label>
                  <select
                    value={filters.priceRangeIndex}
                    onChange={(e) => {
                      handlePricePreset(Number(e.target.value));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {PRICE_RANGES.map((r, idx) => (
                      <option key={idx} value={idx}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Đơn giá điện nước tối đa (2 cột) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      ⚡ Điện max (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 4000"
                      value={filters.maxElectricityPrice}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxElectricityPrice: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      💧 Nước max (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 35000"
                      value={filters.maxWaterPrice}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxWaterPrice: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tiện ích & Quy định (Hiển thị tất cả dạng 2 cột) */}
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Tiện ích & Quy định
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={filters.hasElectricVehicleCharging}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            hasElectricVehicleCharging: e.target.checked,
                          })
                        }
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">Sạc xe điện</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={filters.allowPets}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            allowPets: e.target.checked,
                          })
                        }
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">Nuôi thú cưng</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={filters.freeHours}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            freeHours: e.target.checked,
                          })
                        }
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">Giờ giấc tự do</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={filters.airConditioner}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            airConditioner: e.target.checked,
                          })
                        }
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">Có điều hòa</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 col-span-2 select-none">
                      <input
                        type="checkbox"
                        checked={filters.waterHeater}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            waterHeater: e.target.checked,
                          })
                        }
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span className="truncate">Bình nóng lạnh</span>
                    </label>
                  </div>
                </div>

                {/* Nút tìm kiếm */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer pt-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Áp dụng bộ lọc</span>
                </button>
              </form>
            </div>
          </div>

          {/* ================= CỘT GIỮA: FEED BÀI ĐĂNG (6 Cột) ================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Thanh kết quả & Chip active filter */}
            <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Danh sách phòng cho thuê</span>
                </h2>
                <span className="text-xs text-blue-400 font-semibold">
                  {totalElements} kết quả
                </span>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] text-zinc-400">Đang lọc:</span>
                  {filters.propertyType && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {PROPERTY_TYPE_NAMES[filters.propertyType]}
                      <button
                        onClick={() => handleRemoveFilter("propertyType")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.district && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Quận {DISTRICT_NAMES[filters.district]}
                      <button onClick={() => handleRemoveFilter("district")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.ward && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {filters.ward}
                      <button onClick={() => handleRemoveFilter("ward")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-blue-400 hover:underline ml-auto font-medium"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Danh sách bài đăng */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                <Search className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">
                  Không tìm thấy phòng phù hợp
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Hãy thử nới lỏng các tiêu chí lọc để xem thêm nhiều phòng trọ.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {posts.map((post) => {
                  const districtName =
                    DISTRICT_NAMES[post.room?.district] ||
                    post.room?.district?.replace("_", " ");
                  const propertyTypeName =
                    PROPERTY_TYPE_NAMES[post.room?.propertyType] || "Phòng trọ";
                  const defaultImage =
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop";
                  const coverImage =
                    post.room?.images && post.room.images.length > 0
                      ? post.room.images[0]
                      : defaultImage;

                  return (
                    <div
                      key={post.id}
                      className="group rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md"
                    >
                      <div>
                        {/* Header bài đăng */}
                        <div className="p-3.5 border-b border-zinc-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                              {post.room?.landlord?.fullName
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                                {post.room?.landlord?.fullName || "Chủ trọ"}
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                              </h4>
                              <p className="text-[10px] text-zinc-400">
                                {propertyTypeName} • Quận {districtName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            Đã duyệt
                          </span>
                        </div>

                        {/* Tiêu đề & Giá */}
                        <div className="p-3.5 pb-2">
                          <Link to={`/posts/${post.id}`}>
                            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
                              {post.room?.title}
                            </h3>
                          </Link>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-amber-400">
                              {post.room?.price?.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              VNĐ/tháng
                            </span>
                          </div>
                        </div>

                        {/* Ảnh bài viết */}
                        <Link
                          to={`/posts/${post.id}`}
                          className="block relative aspect-video overflow-hidden bg-zinc-950"
                        >
                          <img
                            src={coverImage}
                            alt={post.room?.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultImage;
                            }}
                          />
                          {post.room?.images && post.room.images.length > 1 && (
                            <div className="absolute bottom-2.5 right-2.5">
                              <span className="inline-flex items-center gap-1 text-[10px] text-white bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-700">
                                <Camera className="w-3 h-3" />
                                {post.room.images.length} ảnh
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Thông tin diện tích, địa chỉ */}
                        <div className="p-3.5 space-y-2 text-xs text-zinc-300">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Diện tích:</span>
                            <strong className="text-zinc-200">
                              {post.room?.area} m²
                            </strong>
                          </div>
                          <div className="flex items-start gap-2 text-zinc-400">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              {post.room?.address}
                              {post.room?.ward ? `, ${post.room.ward}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Nút liên hệ */}
                      <div className="px-3.5 py-2.5 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
                        {user && user.id === post.room?.landlord?.id ? (
                          <Link
                            to="/my-posts"
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                          >
                            Quản lý bài
                          </Link>
                        ) : post.room?.landlord?.phoneNumber ||
                          post.room?.landlord?.phone ? (
                          <a
                            href={`tel:${post.room?.landlord?.phoneNumber || post.room?.landlord?.phone}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Gọi chủ trọ</span>
                          </a>
                        ) : (
                          <div />
                        )}

                        <Link
                          to={`/posts/${post.id}`}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Chi tiết</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="text-xs text-zinc-400 px-2">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* ================= CỘT PHẢI: LƯU Ý & LIÊN HỆ ADMIN (3 Cột) ================= */}
          <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
            {/* Card 1: Lưu ý khi thuê trọ */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-4 shadow-xl shadow-black/40 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Lưu ý khi thuê trọ</span>
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Không chuyển cọc trước</strong> khi chưa xem phòng
                    và xác thực trực tiếp chủ trọ.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>
                    Kiểm tra kỹ hợp đồng thuê nhà: thời hạn, giá điện, nước,
                    internet và phí dịch vụ phát sinh.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>
                    Kiểm tra hiện trạng thiết bị trong phòng (điều hòa, nóng
                    lạnh) trước khi nhận phòng.
                  </span>
                </li>
              </ul>
            </div>

            {/* Card 2: Liên hệ Admin / Gửi Email */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-900 border border-blue-500/20 p-4 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Cần hỗ trợ / Báo cáo?</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bạn gặp bài đăng lừa đảo hoặc cần giải đáp thắc mắc về nền tảng
                HanoiRent? Hãy gửi email trực tiếp cho quản trị viên.
              </p>
              <a
                href="mailto:iamhuy06122005@gmail.com?subject=Hỗ%20trợ%20/%20Báo%20cáo%20từ%20HanoiRent&body=Xin%20chào%20Admin,%20tôi%20muốn%20báo%20cáo/hỏi%20về%20vấn%20đề:"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
              >
                <Mail className="w-4 h-4" />
                <span>Gửi Email cho Admin</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
