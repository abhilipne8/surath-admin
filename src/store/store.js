import { configureStore } from '@reduxjs/toolkit';
import withdrawalReducer from './withdrawal/withdrawalListSlice'
import authReducer from './auth/authSlice'
import depositeReducer from './deposite/depositeSlice'
import surathReducer from './surath/surath'
import bankAccountsReducer from './bankAccount/bankAccountSlice'
import userReducer from './user/userSlice'

const store = configureStore({
  reducer: {
    withdrawals: withdrawalReducer,
    deposites: depositeReducer,
    auth: authReducer,
    surath:surathReducer,
    bankAccounts: bankAccountsReducer,
    user: userReducer
  },
  // devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
