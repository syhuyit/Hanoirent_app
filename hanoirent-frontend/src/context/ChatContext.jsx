import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API from "../api/axios";
import { ChatContext } from "./ChatContextInstance";

export function ChatProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const listenersRef = useRef(new Set());

  const onNewMessage = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  // Lấy thông tin user hiện tại
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Cập nhật lại user khi đăng nhập/đăng xuất
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Tải số tin nhắn chưa đọc ban đầu qua REST API
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/chat/unread-count");
      setUnreadCount(Number(res.data) || 0);
    } catch {
      // Bỏ qua lỗi nếu chưa đăng nhập
    }
  }, []);

  // Khởi tạo kết nối STOMP WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!token || !user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    // Tải số lượng tin nhắn chưa đọc bất đồng bộ
    API.get("/chat/unread-count")
      .then((res) => {
        setUnreadCount(Number(res.data) || 0);
      })
      .catch(() => {});

    // Thiết lập client STOMP qua SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      // 1. Đăng ký nhận thông báo tin nhắn mới tới user này (kênh topic)
      client.subscribe(`/topic/user.${user.id}`, (message) => {
        try {
          const newMsg = JSON.parse(message.body);
          // Tăng số lượng tin chưa đọc
          setUnreadCount((prev) => prev + 1);
          listenersRef.current.forEach((cb) => {
            try {
              cb(newMsg);
            } catch (err) {
              console.error("Lỗi callback tin nhắn:", err);
            }
          });
        } catch (e) {
          console.error("Lỗi parse tin nhắn STOMP:", e);
        }
      });

      // 2. Đăng ký fallback kênh private STOMP
      client.subscribe("/user/queue/messages", (message) => {
        try {
          const newMsg = JSON.parse(message.body);
          if (newMsg.recipientId === user.id) {
            setUnreadCount((prev) => prev + 1);
          }
          listenersRef.current.forEach((cb) => {
            try {
              cb(newMsg);
            } catch (err) {
              console.error("Lỗi callback tin nhắn queue:", err);
            }
          });
        } catch (e) {
          console.error("Lỗi parse tin nhắn queue:", e);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.warn("STOMP error:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [currentUser]);

  // Hàm gửi tin nhắn qua WebSocket STOMP
  const sendMessage = useCallback((chatRoomId, recipientId, content) => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user) throw new Error("Chưa đăng nhập");

    const payload = {
      chatRoomId,
      senderId: user.id,
      recipientId, // partnerId từ Chat.jsx truyền vào đây
      content,
    };

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(payload),
      });
    } else {
      console.warn("WebSocket chưa kết nối");
    }
  }, []); // Xóa currentUser khỏi dependency array

  // Hàm đăng ký nhận tin nhắn của một phòng cụ thể (/topic/room.{roomId})
  const subscribeToRoom = useCallback((roomId, onMessageReceived) => {
    if (!clientRef.current || !clientRef.current.connected) {
      return null;
    }

    return clientRef.current.subscribe(`/topic/room.${roomId}`, (message) => {
      try {
        const parsed = JSON.parse(message.body);
        onMessageReceived(parsed);
      } catch (err) {
        console.error("Lỗi parse tin nhắn phòng:", err);
      }
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        fetchUnreadCount,
        isConnected,
        sendMessage,
        subscribeToRoom,
        onNewMessage,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
