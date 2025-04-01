// src/types.ts
export interface User {
    id: number;
    email: string;
    name?: string | null;
    fullName?: string | null;
    passwordHash: string;
    phoneNumber?: string | null;
    role: string;
  }