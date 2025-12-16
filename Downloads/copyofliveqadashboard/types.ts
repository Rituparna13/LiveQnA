export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  token?: string; // Simulated JWT
}

export enum QuestionStatus {
  PENDING = 'Pending',
  ANSWERED = 'Answered',
  ESCALATED = 'Escalated'
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string; // 'guest' if not logged in
  username: string;
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export interface Question {
  id: string;
  userId: string; // 'guest' if not logged in
  username: string;
  content: string;
  status: QuestionStatus;
  timestamp: string; // ISO string
  answers: Answer[];
}

export type Page = 'LOGIN' | 'REGISTER' | 'DASHBOARD';
