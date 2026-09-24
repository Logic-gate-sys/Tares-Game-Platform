import { configureStore } from "@reduxjs/toolkit";
import { socketMiddleware } from "./middleware";
import lobbyReducer from "./slices/lobby";
import arenaReducer from './slices/arena'
import { baseApi } from "./services/baseApi";
import authReducer  from "./slices/auth";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    lobby: lobbyReducer,
    arena: arenaReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (middleware) => middleware().concat(baseApi.middleware, socketMiddleware()),
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
