export interface User {
  _id: string;
  fullName: string;
  email?: string;
  mobile?: string;
  photo?: string;
  language: string;
  createdAt: string;
}

export interface Resume {
  _id?: string;
  userId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    profilePhoto?: string;
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface SignupData {
  fullName: string;
  email?: string;
  mobile?: string;
  password: string;
  confirmPassword: string;
  language: string;
  termsAccepted: boolean;
  photo?: File;
}