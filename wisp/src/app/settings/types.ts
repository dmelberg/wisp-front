export interface Category {
  id: number;
  name: string;
  household: {
    id: number;
    name: string;
  };
  distribution_type: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DistributionType {
  id: number;
  name: string;
}

export interface Member {
  id: number;
  name: string;
  household: {
    id: number;
    name: string;
  } | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Salary {
  id: number;
  amount: number;
  period: {
    id: number;
    period: string;
  };
  member: {
    id: number;
    name: string;
  };
} 