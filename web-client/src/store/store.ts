import { configureStore } from "@reduxjs/toolkit";
import { socketMiddleware } from "./middleware";
import lobbyReducer from "./slices/lobby";
import gameReduer from './slices/lobby'
import { baseApi } from "./services/api-slice";
import authSlice  from "./slices/auth";


export const store = configureStore({
  reducer: {
    auth: authSlice,
    lobby: lobbyReducer,
    ingame: gameReduer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (middleware) => middleware().concat(baseApi.middleware, socketMiddleware()),
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
