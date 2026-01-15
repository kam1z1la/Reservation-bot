export interface Reservation {

  clientId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  
  seatId: number;
  date: string;
  time: string;
  numberOfPeople: number;
  messageId: number;
  reminder: boolean;
}