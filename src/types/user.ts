export type ProfileResponse = {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  image: string | null;
  email: string;
  roles: string[];
};
