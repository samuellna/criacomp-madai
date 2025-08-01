import axios from "axios";

const api = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

export default api;
