import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/userSlice';
import adminReducer from '../features/adminSlice';
import luzReducer from '../features/luzSlice';
import solarPanelReducer from '../features/solarPanelSlice';


export const store = configureStore({
    reducer: {
        user: userReducer,
        admin: adminReducer,
        luz: luzReducer,
        solarPanel: solarPanelReducer
    },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;