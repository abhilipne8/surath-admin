import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

// Async Thunk to fetch deposits
export const getAllUserList = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/all-User-list', {
        params: { page, limit, search }, // Include search as a query parameter
      });
      return response.data; // Assuming response.data contains `data` and `pagination`
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, bonusAmount, availableBalance }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/user/${userId}`, { bonusAmount, availableBalance });
      return response.data; // Updated user data
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


export const getUserBets = createAsyncThunk(
  'users/userBets',
  async ({ userId }, { rejectWithValue }) => {
    try {
      console.log("step 1")
      const response = await api.get(`/admin/user/bets/${userId}`);
      console.log("userBets List =>", response.data)
      return response.data; // Updated user data
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userList: [],
    userBets: [],
    userWithdrawls : [],
    userDeposites : [],
    userLoading: false,
    error: null,
    updateUserMessage : null,
    pagination: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Handle the state when fetchDepositeList is pending
      .addCase(getAllUserList.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(getAllUserList.fulfilled, (state, action) => {
        state.userLoading = false;
        // Ensure we access the right property in response (action.payload)
        state.userList = action.payload.data || action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllUserList.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload || "Failed to fetch deposit list";
      })
      .addCase(getUserBets.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(getUserBets.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userBets = action.payload.data || action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserBets.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload || "Failed to fetch deposit list";
      })
      .addCase(updateUser.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userLoading = false;
        state.updateUserMessage = action.payload.message || "Failed to update user";
        toast.error(action?.payload?.message)
      })
  },
});

export default userSlice.reducer;