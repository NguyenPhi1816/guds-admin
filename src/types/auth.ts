export type LoginRequest = {
  phoneNumber: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expires: Date;
  user: {
    name: string;
    email: string;
    image: string;
    id: number;
  };
  provider: string;
  providerAccountId: number;
};

export type RefreshTokenResponse = {
  access_token: string;
};
