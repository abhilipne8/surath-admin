import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async Thunk to fetch withdrawals
export const fetchWithdrawals = createAsyncThunk(
  'withdrawals/fetchWithdrawals',
  async ({ status = "pending", _id = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get('/withdraw/all-withdraw-requests', {
        params: {
          status,
          _id: _id || undefined, // Only send if not empty
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Async Thunk to fetch bank account data for a withdrawal
export const fetchWithdrawalBankAccount = createAsyncThunk(
  'withdrawals/fetchWithdrawalBankAccount',
  async (bankId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/withdraw/bank-account/${bankId}`); // Replace with your API endpoint
      return response.data; // Assuming response.data contains the bank account details
    } catch (error) {
      // Handle API errors
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const approvedWithdrawaRequest = createAsyncThunk(
  'withdrawals/approveWithdraw',
  async (withdrawId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/withdraw/approve-withdraw/${withdrawId}`); // Replace with your API endpoint
      return response.data; // Assuming response.data contains the bank account details
    } catch (error) {
      // Handle API errors
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const rejctdWithdrawaRequest = createAsyncThunk(
  'withdrawals/rejectWithdraw',
  async ({ withdrawId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/withdraw/reject-withdraw/${withdrawId}`, { reason }); // Replace with your API endpoint
      return response.data; // Assuming response.data contains the updated withdrawal
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


export const getWithdrawTotalByDate = createAsyncThunk(
  'withdrawals/withdrawTotal',
  async (date , { rejectWithValue }) => {
    try {
      const response = await api.get(`/withdraw/total/${date}`); // Replace with your API endpoint
      return response.data; // Assuming response.data contains the updated withdrawal
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Withdrawal Slice
const withdrawalSlice = createSlice({
  name: 'withdrawals',
  initialState: {
    withdrawalDataList: [],
    loading: false,
    error: null,
    bankaccountLoading: false,  // Changed default to false
    bankAccount: null,
    error: null,
    withdrawRequestLoading: false,
    totalWithdrawAmount: null
  },
  reducers: {
    clearWithdrawals(state) {
      state.withdrawalDataList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle the state when fetchWithdrawals is pending
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawalDataList = action.payload.data || action.payload;
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch withdrawals";
      })
      // Handle fetchWithdrawalBankAccount cases
      .addCase(fetchWithdrawalBankAccount.pending, (state) => {
        state.bankaccountLoading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalBankAccount.fulfilled, (state, action) => {
        state.bankaccountLoading = false;
        state.bankAccount = action.payload.data || action.payload;
      })
      .addCase(fetchWithdrawalBankAccount.rejected, (state, action) => {
        state.bankaccountLoading = false;
        state.error = "Failed to fetch bank account data";
      })

      // handle fetch withdraw total amount 
      .addCase(getWithdrawTotalByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWithdrawTotalByDate.fulfilled, (state, action) => {

        state.loading = false;
        state.totalWithdrawAmount = action.payload
      })
      .addCase(getWithdrawTotalByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = "Failed to fetch bank account data";
      })

      // Handle approvedWithdrawaRequest cases
      .addCase(approvedWithdrawaRequest.pending, (state) => {
        state.withdrawRequestLoading = true;
        state.error = null;
      })
      .addCase(approvedWithdrawaRequest.fulfilled, (state, action) => {
        state.withdrawRequestLoading = false;
        const updatedWithdrawal = action.payload.data;
        // // Update the withdrawal list if needed
        state.withdrawalDataList = state.withdrawalDataList.map((withdrawal) =>
          withdrawal._id === updatedWithdrawal._id
            ? { ...withdrawal, status: updatedWithdrawal.status } // Create a new object with updated status
            : withdrawal
        );
      })
      .addCase(approvedWithdrawaRequest.rejected, (state, action) => {
        state.withdrawRequestLoading = false;
        state.error = "Failed to approve withdrawal request";
      })

      .addCase(rejctdWithdrawaRequest.pending, (state) => {
        state.withdrawRequestLoading = true;
        state.error = null;
      })
      .addCase(rejctdWithdrawaRequest.fulfilled, (state, action) => {
        state.withdrawRequestLoading = false;
        const updatedWithdrawal = action.payload.data;
      
        // Update the withdrawal list
        state.withdrawalDataList = state.withdrawalDataList.map((withdrawal) =>
          withdrawal._id === updatedWithdrawal._id
            ? { ...withdrawal, status: updatedWithdrawal.status } // Update the status
            : withdrawal
        );
      })
      .addCase(rejctdWithdrawaRequest.rejected, (state, action) => {
        state.withdrawRequestLoading = false;
        state.error = "Failed to Reject withdrawal request";
      });
  },
});

export const { clearWithdrawals } = withdrawalSlice.actions;
export default withdrawalSlice.reducer;
