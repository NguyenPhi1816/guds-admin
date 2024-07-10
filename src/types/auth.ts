export type LoginRequest = {
  phoneNumber: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};
