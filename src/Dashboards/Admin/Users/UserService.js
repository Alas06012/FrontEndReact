import axios from "axios";
import { API_URL } from '/config.js';

const config = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});

export const fetchUsers = (filters, token) => {
  return axios.post(`${API_URL}/users`, filters, config(token));
};

export const createUser = (userData, token) => {
  return axios.post(`${API_URL}/users/create`, userData, config(token));
};

export const editUser = (userData, token) => {
  return axios.put(`${API_URL}/users/edit`, userData, config(token));
};

export const deactivateUser = (email, token) => {
  return axios.delete(`${API_URL}/users/deactivate`, {
    ...config(token),
    data: { email }
  });
};

export const activateUser = (email, token) => {
  return axios.put(`${API_URL}/users/activate`, { email }, config(token));
};
