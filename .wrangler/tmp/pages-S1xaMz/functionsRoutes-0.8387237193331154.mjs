import { onRequestPost as __api_chat_ts_onRequestPost } from "/home/iamkdraj/EdumyntProject/edumynt.in/functions/api/chat.ts"
import { onRequest as __api_chat_ts_onRequest } from "/home/iamkdraj/EdumyntProject/edumynt.in/functions/api/chat.ts"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_ts_onRequestPost],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_chat_ts_onRequest],
    },
  ]