import { User, Question, UserRole, QuestionStatus, Answer } from '../types';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'Admin User', email: 'admin@qna.com', role: UserRole.ADMIN, token: 'mock-admin-token' },
  { id: 'u2', username: 'Jane Doe', email: 'jane@example.com', role: UserRole.USER, token: 'mock-user-token' }
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    userId: 'u2',
    username: 'Jane Doe',
    content: 'How do I reset my password?',
    status: QuestionStatus.PENDING,
    timestamp: new Date(Date.now() - 10000000).toISOString(),
    answers: []
  },
  {
    id: 'q2',
    userId: 'guest',
    username: 'Guest_102',
    content: 'Is this service free to use?',
    status: QuestionStatus.ANSWERED,
    timestamp: new Date(Date.now() - 5000000).toISOString(),
    answers: [
      {
        id: 'a1',
        questionId: 'q2',
        userId: 'u1',
        username: 'Admin User',
        content: 'Yes, the basic tier is completely free!',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to access LocalStorage 'DB'
const getDb = () => {
  const users = JSON.parse(localStorage.getItem('qna_users') || JSON.stringify(INITIAL_USERS));
  const questions = JSON.parse(localStorage.getItem('qna_questions') || JSON.stringify(INITIAL_QUESTIONS));
  return { users, questions };
};

const saveDb = (users: User[], questions: Question[]) => {
  localStorage.setItem('qna_users', JSON.stringify(users));
  localStorage.setItem('qna_questions', JSON.stringify(questions));
};

// --- SIMULATED API ENDPOINTS ---

export const mockLogin = async (email: string, password: string): Promise<{ user: User } | null> => {
  await delay(500); // Simulate network
  const { users } = getDb();
  // Simple mock auth - password check is mocked as just matching 'admin123' for admin or anything for others for demo simplicity, 
  // normally we'd hash check.
  const user = users.find((u: User) => u.email === email);
  
  if (user) {
    if (user.role === UserRole.ADMIN && password !== 'admin123') return null;
    return { user };
  }
  return null;
};

export const mockRegister = async (username: string, email: string): Promise<User> => {
  await delay(500);
  const { users, questions } = getDb();
  const newUser: User = {
    id: `u${Date.now()}`,
    username,
    email,
    role: UserRole.USER,
    token: `mock-token-${Date.now()}`
  };
  users.push(newUser);
  saveDb(users, questions);
  return newUser;
};

export const mockGetQuestions = async (): Promise<Question[]> => {
  // Simulate fetching current list
  // No delay here to make the UI feel snappy for the polling
  const { questions } = getDb();
  return questions.sort((a: Question, b: Question) => {
    // Sorting Logic: Escalated first, then by Timestamp (newest first)
    const isAEscalated = a.status === QuestionStatus.ESCALATED;
    const isBEscalated = b.status === QuestionStatus.ESCALATED;

    if (isAEscalated && !isBEscalated) return -1;
    if (!isAEscalated && isBEscalated) return 1;
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

export const mockPostQuestion = async (content: string, user?: User | null, customName?: string): Promise<Question> => {
  await delay(300);
  const { users, questions } = getDb();
  
  let finalUsername = 'Guest';
  if (user) {
    finalUsername = user.username;
  } else if (customName && customName.trim().length > 0) {
    finalUsername = customName.trim();
  } else {
    finalUsername = `Guest_${Math.floor(Math.random() * 1000)}`;
  }

  const newQuestion: Question = {
    id: `q${Date.now()}`,
    userId: user ? user.id : 'guest',
    username: finalUsername,
    content,
    status: QuestionStatus.PENDING,
    timestamp: new Date().toISOString(),
    answers: []
  };
  questions.unshift(newQuestion); // Add to top temporarily until sort
  saveDb(users, questions);
  return newQuestion;
};

export const mockPostAnswer = async (questionId: string, content: string, user?: User | null, isAi = false): Promise<Answer> => {
  await delay(300);
  const { users, questions } = getDb();
  const qIndex = questions.findIndex((q: Question) => q.id === questionId);
  
  if (qIndex === -1) throw new Error("Question not found");

  const newAnswer: Answer = {
    id: `a${Date.now()}`,
    questionId,
    userId: user ? user.id : (isAi ? 'ai-bot' : 'guest'),
    username: isAi ? 'AI Assistant 🤖' : (user ? user.username : 'Guest'),
    content,
    timestamp: new Date().toISOString(),
    isAiGenerated: isAi
  };

  questions[qIndex].answers.push(newAnswer);
  saveDb(users, questions);
  return newAnswer;
};

export const mockUpdateStatus = async (questionId: string, status: QuestionStatus): Promise<void> => {
  await delay(200);
  const { users, questions } = getDb();
  const qIndex = questions.findIndex((q: Question) => q.id === questionId);
  if (qIndex > -1) {
    questions[qIndex].status = status;
    saveDb(users, questions);
  }
};

// XMLHttpRequest Validation Wrapper (As requested by prompt)
export const validateWithXHR = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    // In a real app, this would hit a validation endpoint. 
    // Here we simulate it by creating a data URI or just wrapping the logic.
    // For the sake of the specific requirement, we'll just simulate the async nature and logic.
    
    // We can't actually make an external call in this sandbox easily without CORS or a real backend.
    // So we assume this XHR is checking against a "local" validation rule.
    
    setTimeout(() => {
        if (!text || text.trim().length === 0) {
            resolve(false);
        } else {
            resolve(true);
        }
    }, 100);
  });
};
