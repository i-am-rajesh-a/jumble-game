export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  avatar: string;
  achievements: Achievement[];
  streak: number;
  powerUps: PowerUp[];
}

export interface Room {
  id: string;
  name: string;
  isPublic: boolean;
  timePerRound: number;
  maxPlayers: number;
  difficulty: string;
  players: Player[];
  status: string;
  currentRound: number;
  maxRounds: number;
  currentWord: string;
  scrambledWord: string;
  currentPlayerIndex: number;
  scores: { [playerId: string]: number };
  achievements: { [playerId: string]: Achievement[] };
  gameTimer: NodeJS.Timeout | null;
  roundStartTime: number | null;
  hints: string[];
  powerUps: { [playerId: string]: PowerUp[] };
  streaks: { [playerId: string]: number };
  turnOrder: Player[];
  correctGuesses: string[]; // Use string[] if correctGuesses are guessed words
  roundScores: { [playerId: string]: number }; // Added for round winner
}

export interface RoundWinner {
  playerId: string;
  playerName: string;
  score: number;
}
export interface GameSettings {
  roomName: string;
  isPublic: boolean;
  timePerRound: number;
  maxPlayers: number;
  difficulty?: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  achievements?: Achievement[];
  maxStreak?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PowerUp {
  id: string;
  type: string;
  description?: string;
  // Add more fields as needed for your game logic
}