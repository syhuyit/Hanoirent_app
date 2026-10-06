import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Maximize2,
  PhoneCall,
  Building2,
  Filter,
  Search,
  Sparkles,
  CheckCircle2,
  Eye,
  Camera,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Zap,
  Droplets,
  Wifi,
  Car,
  Dog,
  Clock,
  Wind,
  Flame,
  ChevronLeft,
  ChevronRight,
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Calculate active filter count (excluding default empty values)
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

        // Backend returns Page<Post>
        if (res.data && Array.isArray(res.data.content)) {
          setPosts(res.data.content);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
          setCurrentPage(res.data.number || 0);
        } else if (Array.isArray(res.data)) {
          // Fallback in case of raw list
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

  // Handle price preset selection
  const handlePricePreset = (index) => {
    const range = PRICE_RANGES[index];
    setFilters((prev) => ({
      ...prev,
      priceRangeIndex: index,
      minPrice: range.min || "",
      maxPrice: range.max || "",
    }));
  };

  // Trigger search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(0);
    fetchPosts(0, filters);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(0);
    fetchPosts(0, INITIAL_FILTERS);
  };

  // Remove individual filter chip
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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    fetchPosts(newPage, filters);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Universal Dark Navbar */}
      <Navbar />

      {/* Hero & Search Filter Section */}
      <section className="relative overflow-hidden pt-10 pb-12 border-b border-zinc-800/80 bg-gradient-to-b from-[#0f111a] via-[#0b0c13] to-[#090a0f]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Nền tảng thuê trọ minh bạch tại Hà Nội
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Tìm phòng trọ, căn hộ ưng ý tại{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Hà Nội
              </span>
            </h1>

            <p className="mt-3 text-sm text-zinc-400 max-w-2xl mx-auto">
              Bộ lọc nâng cao theo khu vực, mô hình, khoảng giá và tiện ích thực
              tế (sạc xe điện, nuôi thú cưng, giờ tự do, điều hòa).
            </p>
          </div>

          {/* Quick Property Type Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => {
                const updated = { ...filters, propertyType: "" };
                setFilters(updated);
                fetchPosts(0, updated);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.propertyType === ""
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
              }`}
            >
              Tất cả loại hình
            </button>
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.code}
                onClick={() => {
                  const updated = {
                    ...filters,
                    propertyType:
                      filters.propertyType === type.code ? "" : type.code,
                  };
                  setFilters(updated);
                  fetchPosts(0, updated);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filters.propertyType === type.code
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                }`}
              >
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Main Search & Filter Form Container */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-5xl mx-auto rounded-3xl bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/90 p-4 sm:p-6 shadow-2xl shadow-black/60"
          >
            {/* Primary Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Quận / Huyện */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Quận / Huyện
                </label>
                <select
                  value={filters.district}
                  onChange={(e) =>
                    setFilters({ ...filters, district: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">Tất cả Quận / Huyện</option>
                  {DISTRICTS.map((d) => (
                    <option key={d.code} value={d.code}>
                      Quận {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Xã / Phường */}
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
                    placeholder="VD: Dịch Vọng, Ô Chợ Dừa..."
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 placeholder-zinc-500 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                  />
                  {filters.ward && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, ward: "" })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Khoảng giá thuê */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  Khoảng giá thuê
                </label>
                <select
                  value={filters.priceRangeIndex}
                  onChange={(e) => handlePricePreset(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {PRICE_RANGES.map((r, idx) => (
                    <option key={idx} value={idx}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Action Buttons (Submit & Toggle Advanced) */}
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm kiếm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    showAdvanced || activeFilterCount > 0
                      ? "bg-zinc-800 border-blue-500/40 text-blue-400"
                      : "bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  }`}
                  title="Mở rộng bộ lọc chi phí & tiện ích"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  {showAdvanced ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Advanced Filter Drawer */}
            {showAdvanced && (
              <div className="mt-5 pt-5 border-t border-zinc-800/80 space-y-5 animate-in fade-in duration-200">
                {/* Section A: Chi phí dịch vụ tối đa */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Đơn giá Dịch vụ Tối đa (Lọc phòng có đơn giá hợp lý)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Điện tối đa (VNĐ/kWh)
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
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        Nước tối đa (VNĐ/m³ hoặc người)
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
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        Internet tối đa (VNĐ/tháng)
                      </label>
                      <input
                        type="number"
                        placeholder="VD: 100000"
                        value={filters.maxInternetPrice}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxInternetPrice: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Tiện ích & Quy định */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    Tiện ích, Chỗ để xe & Quy định
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {/* Bãi xe */}
                    <div className="col-span-2 sm:col-span-1">
                      <select
                        value={filters.minParkingSlots}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minParkingSlots: e.target.value,
                          })
                        }
                        className="w-full h-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-2.5 py-2 focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">🛵 Chỗ gửi xe: Bất kỳ</option>
                        <option value="1">🛵 Tối thiểu 1 xe</option>
                        <option value="2">🛵 Tối thiểu 2 xe trở lên</option>
                      </select>
                    </div>

                    {/* Sạc xe điện */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        filters.hasElectricVehicleCharging
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
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
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">Sạc xe điện</span>
                    </label>

                    {/* Nuôi thú cưng */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        filters.allowPets
                          ? "bg-pink-500/10 border-pink-500/40 text-pink-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
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
                      <Dog className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span className="truncate">Nuôi thú cưng</span>
                    </label>

                    {/* Giờ giấc tự do */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        filters.freeHours
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
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
                      <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">Giờ giấc tự do</span>
                    </label>

                    {/* Điều hòa */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        filters.airConditioner
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
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
                      <Wind className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="truncate">Có điều hòa</span>
                    </label>

                    {/* Bình nóng lạnh */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        filters.waterHeater
                          ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
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
                      <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span className="truncate">Bình nóng lạnh</span>
                    </label>
                  </div>
                </div>

                {/* Section C: Controls footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại tất cả bộ lọc</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Áp dụng bộ lọc
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="max-w-5xl mx-auto mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                Đang lọc theo:
              </span>

              {filters.propertyType && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {PROPERTY_TYPE_NAMES[filters.propertyType]}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("propertyType")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.district && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Quận {DISTRICT_NAMES[filters.district]}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("district")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.ward && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Phường/Xã: &quot;{filters.ward}&quot;
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("ward")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.priceRangeIndex > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {PRICE_RANGES[filters.priceRangeIndex].label}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("price")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.maxElectricityPrice && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  ⚡ Điện ≤{" "}
                  {Number(filters.maxElectricityPrice).toLocaleString()} đ
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("maxElectricityPrice")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.maxWaterPrice && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  💧 Nước ≤ {Number(filters.maxWaterPrice).toLocaleString()} đ
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("maxWaterPrice")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.maxInternetPrice && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  🌐 Internet ≤{" "}
                  {Number(filters.maxInternetPrice).toLocaleString()} đ
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("maxInternetPrice")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.minParkingSlots &&
                Number(filters.minParkingSlots) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    🛵 Xe ≥ {filters.minParkingSlots}
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter("minParkingSlots")}
                      className="hover:text-white ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

              {filters.hasElectricVehicleCharging && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  ⚡ Sạc xe điện
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveFilter("hasElectricVehicleCharging")
                    }
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.allowPets && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                  🐾 Nuôi thú cưng
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("allowPets")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.freeHours && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  🕒 Giờ tự do
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("freeHours")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.airConditioner && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  ❄️ Có điều hòa
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("airConditioner")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.waterHeater && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/30">
                  🔥 Có nóng lạnh
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("waterHeater")}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold ml-1 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Listing Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results Header */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>
                {filters.propertyType
                  ? PROPERTY_TYPE_NAMES[filters.propertyType]
                  : "Danh sách phòng cho thuê"}
                {filters.district
                  ? ` tại Quận ${DISTRICT_NAMES[filters.district]}`
                  : ""}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {loading ? (
                "Đang tìm kiếm phòng trọ..."
              ) : (
                <>
                  Tìm thấy{" "}
                  <strong className="text-blue-400 font-bold">
                    {totalElements}
                  </strong>{" "}
                  bài đăng phù hợp
                  {totalPages > 1 &&
                    ` (Trang ${currentPage + 1}/${totalPages})`}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Bố cục 3 cột: Trái (Để trống/Phát triển sau) - Giữa (Feed Bài Đăng) - Phải (Để trống/Phát triển sau) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột Trái (Sidebar Trái - 3 cột): Sau này làm Menu/Shortcuts */}
          <div className="hidden lg:block lg:col-span-3">
            {/* Để trống sẵn cho bạn phát triển sau */}
          </div>

          {/* Cột Giữa (Main Feed - 6 cột): Chứa danh sách bài đăng 1 dòng 1 Card */}
          <div className="lg:col-span-6 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-96 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse flex flex-col justify-between overflow-hidden"
                  >
                    <div className="w-full h-56 bg-zinc-800" />
                    <div className="p-5 space-y-3">
                      <div className="w-24 h-4 bg-zinc-800 rounded-full" />
                      <div className="w-3/4 h-5 bg-zinc-800 rounded-lg" />
                      <div className="w-1/2 h-6 bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Chưa tìm thấy phòng phù hợp
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Không có bài đăng nào khớp với các tiêu chí tìm kiếm hiện tại.
                  Bạn hãy thử mở rộng khoảng giá hoặc bỏ bớt các bộ lọc tiện
                  ích!
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    Đặt lại tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              /* FEED BÀI ĐĂNG - 1 DÒNG 1 CARD */
              <div className="flex flex-col gap-6">
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
                      className="group rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 hover:border-zinc-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        {/* Header bài đăng dạng MXH: Avatar chủ trọ + Tên + Thời gian/Loại hình */}
                        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                              {post.room?.landlord?.fullName
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                                {post.room?.landlord?.fullName || "Chủ trọ"}
                                <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                              </h4>
                              <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                                <span>{propertyTypeName}</span>
                                <span>•</span>
                                <span>Quận {districtName}</span>
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã duyệt
                          </span>
                        </div>

                        {/* Tiêu đề & Thông tin nhanh */}
                        <div className="p-4 pb-3">
                          <Link to={`/posts/${post.id}`}>
                            <h3 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                              {post.room?.title}
                            </h3>
                          </Link>

                          {/* Giá thuê nổi bật */}
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-2xl font-black text-amber-400 tracking-tight">
                              {post.room?.price?.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                              VNĐ/tháng
                            </span>
                          </div>
                        </div>

                        {/* Image Banner (Hình ảnh đăng dạng lớn chuẩn Social Feed) */}
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

                          {/* Photo counter (Bottom Right) */}
                          {post.room?.images && post.room.images.length > 1 && (
                            <div className="absolute bottom-3 right-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700/60">
                                <Camera className="w-3.5 h-3.5" />
                                {post.room.images.length} ảnh
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Content & Details Section */}
                        <div className="p-4 space-y-3">
                          {/* Details Box */}
                          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
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

                          {/* Quick Amenities Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {post.room?.airConditioner && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                                ❄️ Điều hòa
                              </span>
                            )}
                            {post.room?.waterHeater && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20 font-medium">
                                🔥 Nóng lạnh
                              </span>
                            )}
                            {post.room?.hasElectricVehicleCharging && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                                ⚡ Sạc xe điện
                              </span>
                            )}
                            {post.room?.allowPets && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                                🐾 Nuôi pet
                              </span>
                            )}
                            {post.room?.freeHours && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                                🕒 Giờ tự do
                              </span>
                            )}
                            {post.room?.parkingSlots > 0 && (
                              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                                🛵 Có chỗ xe ({post.room.parkingSlots})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Landlord Contact Footer & Action Button */}
                      <div className="px-4 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {user && user.id === post.room?.landlord?.id ? (
                            <Link
                              to="/my-posts"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Quản lý</span>
                            </Link>
                          ) : post.room?.landlord?.phoneNumber ||
                            post.room?.landlord?.phone ? (
                            <a
                              href={`tel:${post.room?.landlord?.phoneNumber || post.room?.landlord?.phone}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Gọi chủ trọ</span>
                            </a>
                          ) : null}
                        </div>

                        <Link
                          to={`/posts/${post.id}`}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trang trước</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => {
                    if (
                      i === 0 ||
                      i === totalPages - 1 ||
                      (i >= currentPage - 1 && i <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentPage === i
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                      return (
                        <span key={i} className="px-1 text-zinc-600 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cột Phải (Sidebar Phải - 3 cột): Sau này làm Gợi ý/Tiện ích thêm */}
          <div className="hidden lg:block lg:col-span-3">
            {/* Để trống sẵn cho bạn phát triển sau */}
          </div>
        </div>
      </main>
    </div>
  );
}
