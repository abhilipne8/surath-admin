import { configureStore } from '@reduxjs/toolkit';
import withdrawalReducer from './withdrawal/withdrawalListSlice'
import authReducer from './auth/authSlice'
import depositeReducer from './deposite/depositeSlice'
import upiDepositeReducer from './deposite/upiDepositeSlice'
import surathReducer from './surath/surath'
import bankAccountsReducer from './bankAccount/bankAccountSlice'
import userReducer from './user/userSlice'
import dragonTigerReducer from './games/dragon-tiger/dragonTigerSlice'
import andarBaharReducer from './games/andar-bahar/andarBaharSlice'

const store = configureStore({
  reducer: {
    withdrawals: withdrawalReducer,
    deposites: depositeReducer,
    auth: authReducer,
    surath:surathReducer,
    bankAccounts: bankAccountsReducer,
    user: userReducer,
    dragonTiger: dragonTigerReducer,
    andarBahar: andarBaharReducer,
    upiDeposite: upiDepositeReducer
  },
  // devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
