import axios from "axios";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  return instance;
};

export default createAxiosInstance();
