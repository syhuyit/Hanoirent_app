import { useContext } from "react";
import { ChatContext } from "./ChatContextInstance";

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat phải được dùng bên trong ChatProvider");
  }
  return context;
}
