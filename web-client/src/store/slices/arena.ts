import type { Room } from "#types/entities";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export type GameState = {
  status: "room:out" | "room:in" | "idle" | "round-started" | "round-playing" | "round-over" | "error";
  room?: Room; // users active room
  roomId: string;   // user's active room
  scores: unknown[]; // ingame scores arranged in order
  players: unknown[];
  scramble?: string; // what user is to scramble
  word?: string; // word user wants to submit
  round?: { roundNo?: number, winnerId?: string };// current round
  timer?: number; // active timer
}

const initGameState: GameState = {
  status: "idle",
  roomId: "",
  scores: [],
  players: []
}

export const gameSlice = createSlice({
  // state
  name: 'arena',
  initialState: initGameState,
  reducers: {
    setScramble: (state, action: PayloadAction<GameState['scramble']>) => {
      state.scramble = action.payload
    },
    changeStatus: (state, action: PayloadAction<GameState['status']>) => {
      state.status = action.payload;
      console.log("STATUS: ", action.payload)
    },
    setRoomId: (state, action: PayloadAction<GameState['roomId']>) => {
      state.roomId = action.payload;
    },
    setRoom: (state, action: PayloadAction<GameState['room']>) => {
      state.room = action.payload;
    },

    setTimer: (state, action: PayloadAction<GameState['timer']>) => {
      state.timer = action.payload;
    },
    setRound: (state, action: PayloadAction<GameState['round']>) => {
      state.round = action.payload;
    },
    setPlayers: (state, action: PayloadAction<GameState['players']>) => {
      state.players = action.payload;
    },
    setScores: (state, action: PayloadAction<GameState['scores']>) => {
      state.scores = action.payload;
    },
    sendWord: (state, action: PayloadAction<GameState['word']>) => { }
  }
})

export const { setScramble, changeStatus, setRoom, setRoomId, setTimer, setRound, setPlayers, setScores, sendWord } = gameSlice.actions;
export default gameSlice.reducer;
