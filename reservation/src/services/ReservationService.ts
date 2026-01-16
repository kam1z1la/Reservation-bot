import axios from 'axios';
import type { Reservation } from '../types/Reservation';

const API_URL = '/api/resd';

  export default {
  async getInitialDraft(): Promise<Reservation> {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;

    if (!tg || !tg.initDataUnsafe?.user) {
       throw new Error('ID клієнта відсутній');
    }

    const user = tg.initDataUnsafe.user;

    const reservationData: Reservation = {
      clientId: user.id,
      firstName: '',
      lastName: '',
      phoneNumber: '', 
      seatId: 0,
      date: '',
      time: '',
      numberOfPeople: 1,
      messageId: 0,
      reminder: false
    };

    return Promise.resolve(reservationData);
  },

    async create(reservation: Reservation) {
      const response = await axios.post(`${API_URL}/create`, reservation);
      return response.data;
    },

    async checkAvailability(date: string) {
      const response = await axios.get(`${API_URL}/availability`, {
        params: { date }
      });
      return response.data;
    }
  };