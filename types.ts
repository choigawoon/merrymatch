export interface User {
  id: string;
  name: string;
  avatar: string;
  isSelf: boolean;
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface Group {
  id: string;
  name: string;
  theme: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  tags: string[];
}

export enum AppState {
  LANDING = 'LANDING',
  MATCHING = 'MATCHING',
  GROUP_ROOM = 'GROUP_ROOM',
}

export interface MatchResult {
  groupName: string;
  theme: string;
  description: string;
  tags: string[];
  initialMembers: number; // Simulated existing members
}