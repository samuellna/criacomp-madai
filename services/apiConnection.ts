import axios from "axios";
import { OPENAI_API_KEY } from "@env";

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY não definida! Verifique seu .env ou EAS Secret.");
}

const api = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
});

export default api;
