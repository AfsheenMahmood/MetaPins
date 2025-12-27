import axios from "axios";
import { BACKEND_URL } from "../config";

export const loginUser = async (username: string, password: string) => {
  const res = await axios.post(`${BACKEND_URL}/login`, { username, password });
  return res.data; // should return user object
};

export const signupUser = async (username: string, password: string) => {
  const res = await axios.post(`${BACKEND_URL}/signup`, { username, password });
  return res.data;
};
