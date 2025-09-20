export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface Checkpoint {
  id: string;
  concept: string;
  userId: string;
  createdAt: Date;
}
