/* import axios from "axios";

const API = "http://localhost:8082/contacts";

export const addContact = (ownerPhone, contactPhone, contactName) => {
  return axios.post(`${API}/add`, {
    ownerPhone,
    contactPhone,
    contactName
  });
};

export const fetchContacts = (ownerPhone) => {
  return axios.get(`${API}/${ownerPhone}`);
};
 */

import axios from "axios";

const API = "/api/chat/contacts";

export const addContact = (ownerPhone, contactPhone, contactName) => {
  return axios.post(`${API}/add`, {
    ownerPhone,
    contactPhone,
    contactName
  });
};

export const fetchContacts = (ownerPhone) => {
  return axios.get(`${API}/${ownerPhone}`);
};

