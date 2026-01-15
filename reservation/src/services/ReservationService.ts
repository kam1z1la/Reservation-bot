import axios from 'axios';
import type { Reservation } from '../types/Reservation';

const API_URL = 'http://localhost:2303/reservations';

export default {
  async getInitialDraft(): Promise<Reservation> {
    const response = await axios.get<Reservation>(`${API_URL}/init`);
    if (!response.data.clientId) {
      throw new Error('ID клієнта відсутній');
    }
    return response.data;
  },

  async create(reservation: Reservation) {
    const response = await axios.post(API_URL, reservation);
    return response.data;
  },

  async checkAvailability(date: string) {
    const response = await axios.get(`${API_URL}/availability`, {
      params: { date }
    });
    return response.data;
  }
};