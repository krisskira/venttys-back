import { ROL } from ".";

export interface CommerceUser {
  auth_id: string;
  address: string;
  commerce: string;
  email: string;
  name: string;
  phone: string;
  rol: ROL;
  password?: string;
  is_enable?: boolean;
}
