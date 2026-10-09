import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Send,
  MessageCircle,
  User as UserIcon,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { useChat } from "../context/useChat";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sendMessage, subscribeToRoom, setUnreadCount, fetchUnreadCount, onNewMessage } = useChat();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);
  const activeRoomRef = useRef(activeRoom);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Tự động cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Tải danh sách các phòng chat
  const fetchRooms = useCallback(async () => {
    try {
      const res = await API.get("/chat/rooms");
      const roomList = Array.isArray(res.data) ? res.data : [];
      setRooms(roomList);
      return roomList;
    } catch (err) {
      console.error("Lỗi tải danh sách phòng chat:", err);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Tải lịch sử tin nhắn của 1 phòng
  const selectRoom = useCallback(async (room) => {
    if (!room) return;
    setActiveRoom(room);
    setLoadingMessages(true);

    try {
      const res = await API.get(`/chat/messages/${room.id}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      // Đã đọc tin nhắn trong phòng này -> Cập nhật lại unread count trên Navbar
      fetchUnreadCount();

      // Cập nhật lại unreadCount = 0 của phòng này trong danh sách
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
      );
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [fetchUnreadCount]);

  // Khởi tạo và xử lý query param roomId hoặc recipientId
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let isMounted = true;

    async function init() {
      const targetRoomId = searchParams.get("roomId");
      const targetRecipientId = searchParams.get("recipientId");

      let currentRoomList = await fetchRooms();
      if (!isMounted) return;

      if (targetRecipientId) {
        // Tạo hoặc lấy phòng chat với recipientId
        try {
          const res = await API.post("/chat/rooms", {
            recipientId: Number(targetRecipientId),
          });
          const targetRoom = res.data;
          currentRoomList = await fetchRooms();
          const found = currentRoomList.find((r) => r.id === targetRoom.id) || targetRoom;
          selectRoom(found);
        } catch (e) {
          console.error("Lỗi tạo phòng chat:", e);
        }
      } else if (targetRoomId) {
        // Mở phòng theo roomId
        const found = currentRoomList.find((r) => String(r.id) === String(targetRoomId));
        if (found) {
          selectRoom(found);
        } else if (currentRoomList.length > 0) {
          selectRoom(currentRoomList[0]);
        }
      } else if (currentRoomList.length > 0) {
        // Mặc định chọn phòng đầu tiên
        selectRoom(currentRoomList[0]);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [user, navigate, searchParams, fetchRooms, selectRoom]);

  // Đăng ký nhận tin nhắn thời gian thực của phòng chat đang mở
  useEffect(() => {
    if (!activeRoom) return;

    const subscription = subscribeToRoom(activeRoom.id, (newMsg) => {
      setMessages((prev) => {
        // Tránh trùng lặp id tin nhắn
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Cập nhật preview tin nhắn cuối trong danh sách phòng
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? {
                ...r,
                lastMessage: newMsg.content,
                lastMessageTime: newMsg.timestamp,
              }
            : r
        )
      );

      // Nếu đang mở đúng phòng này thì coi như đã đọc
      setUnreadCount((count) => Math.max(0, count - 1));
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [activeRoom, subscribeToRoom, setUnreadCount]);

  // Lắng nghe tin nhắn mới từ WebSocket đẩy về danh sách phòng
  useEffect(() => {
    if (typeof onNewMessage !== "function") return;

    const unsubscribe = onNewMessage((msg) => {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === msg.chatRoomId) {
            return {
              ...r,
              lastMessage: msg.content,
              lastMessageTime: msg.timestamp,
              unreadCount:
                activeRoomRef.current && activeRoomRef.current.id === r.id
                  ? 0
                  : (r.unreadCount || 0) + 1,
            };
          }
          return r;
        })
      );
    });

    return unsubscribe;
  }, [onNewMessage]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom) return;

    try {
      sendMessage(activeRoom.id, activeRoom.partnerId, messageInput.trim());
      setMessageInput("");
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  // Lọc phòng theo từ khóa tìm kiếm
  const filteredRooms = rooms.filter((r) =>
    (r.partnerName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        {/* Main Chat Container */}
        <div className="flex-1 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/80">
          {/* SIDEBAR: Danh sách cuộc trò chuyện */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-zinc-800/90 flex flex-col bg-zinc-950/60 ${
              activeRoom ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header Sidebar */}
            <div className="p-4 border-b border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span>Trò chuyện</span>
                </h2>
                <span className="text-xs text-zinc-400 font-medium px-2 py-0.5 rounded-full bg-zinc-800/80">
                  {rooms.length} cuộc hội thoại
                </span>
              </div>

              {/* Ô tìm kiếm hội thoại */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên người nhận..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Danh sách phòng */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
              {loadingRooms ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <MessageCircle className="w-10 h-10 mx-auto text-zinc-600" />
                  <p className="text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-xs text-zinc-500">
                    Bấm &quot;Nhắn tin cho Chủ trọ&quot; ở chi tiết phòng để bắt đầu trò chuyện!
                  </p>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = activeRoom && activeRoom.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => selectRoom(room)}
                      className={`w-full p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/10 border-l-4 border-blue-500"
                          : "hover:bg-zinc-900/60 border-l-4 border-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {room.partnerAvatar ? (
                          <img
                            src={room.partnerAvatar}
                            alt={room.partnerName}
                            className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                            {room.partnerName
                              ? room.partnerName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                        {/* Dot online */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-blue-400" : "text-zinc-200"
                            }`}
                          >
                            {room.partnerName}
                          </h4>
                          {room.lastMessageTime && (
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                              {new Date(room.lastMessageTime).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 truncate">
                          {room.lastMessage || "Bắt đầu cuộc trò chuyện..."}
                        </p>
                      </div>

                      {/* Badge tin nhắn chưa đọc */}
                      {room.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-600/30">
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* CHAT WINDOW: Khung chat chính */}
          <div
            className={`flex-1 flex flex-col bg-zinc-900/40 ${
              !activeRoom ? "hidden md:flex" : "flex"
            }`}
          >
            {activeRoom ? (
              <>
                {/* Header Chat Window */}
                <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Nút quay lại trên mobile */}
                    <button
                      onClick={() => setActiveRoom(null)}
                      className="md:hidden p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Partner info */}
                    <div className="relative">
                      {activeRoom.partnerAvatar ? (
                        <img
                          src={activeRoom.partnerAvatar}
                          alt={activeRoom.partnerName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                          {activeRoom.partnerName
                            ? activeRoom.partnerName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-none">
                        {activeRoom.partnerName}
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Đang hoạt động trực tuyến
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-700/60">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Mã phòng: #{activeRoom.id}
                    </span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 p-8 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-2">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-300">
                        Chưa có tin nhắn trong cuộc hội thoại này
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Hãy gửi lời chào đầu tiên để trao đổi về phòng trọ, giá cả và lịch xem phòng!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* Avatar người gửi nếu không phải là tôi */}
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-300 flex-shrink-0 mb-1">
                              {msg.senderName
                                ? msg.senderName.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}

                          {/* Bubble tin nhắn */}
                          <div
                            className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                              isMe
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-blue-500/10"
                                : "bg-zinc-800/90 text-zinc-100 border border-zinc-700/80 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                            <div
                              className={`flex items-center gap-1.5 mt-1 text-[10px] font-medium ${
                                isMe ? "text-blue-200 justify-end" : "text-zinc-400"
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5 opacity-70" />
                              <span>
                                {msg.timestamp
                                  ? new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Vừa xong"}
                              </span>
                              {isMe && (
                                <span title={msg.isRead ? "Đã đọc" : "Đã gửi"}>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-cyan-300" />
                                  ) : (
                                    <Check className="w-3 h-3 text-blue-200 opacity-80" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Nhập nội dung tin nhắn trao đổi..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Gửi</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserIcon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Chọn một cuộc trò chuyện để bắt đầu
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Trò chuyện trực tiếp, trao đổi hợp đồng thuê, thỏa thuận giá cả và hẹn lịch xem phòng trọ an toàn.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
