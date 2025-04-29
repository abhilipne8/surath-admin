import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// Async Thunk for Adding Bank Accounts
export const addBankAccount = createAsyncThunk(
  'bankAccounts/addBankAccount',
  async ( data, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/add-bank-account', data);
      return response.data;
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const editBankAccount = createAsyncThunk(
  'bankAccount/editBankAccount',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/edit-bank-account', data);
      return response.data; // Assuming response contains the updated bank account data
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Async Thunk for Fetching Bank Accounts
export const fetchAllBankAccounts = createAsyncThunk(
  'bankAccounts/fetchAllBankAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/get-bank-account');
      return response.data;
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Async function for changing the bank account status
export const BankAccountStatusChange = createAsyncThunk(
  'bankAccounts/changeStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/set-active-bank-account', {
        accountId: id,
        isActive: isActive,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating status on the backend:', error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const bankAccountsSlice = createSlice({
  name: "bankAccounts",
  initialState: {
    loading: false,
    error: null,
    allbankAccounts: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false;
      
        // Assuming action.payload.data contains the new bank account added
        const newAccount = action.payload.data;
      
        // Append the new account to the existing list of bank accounts
        state.allbankAccounts = [...state.allbankAccounts, newAccount];
      
        state.error = null;
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bank accounts";
      })
      .addCase(editBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAccount = action.payload.data;
      
        // Destructure the updatedAccount to only use valid keys from the API response
        const { _id, ...restOfAccount } = updatedAccount;
      
        // Update the account in the state with the matching _id and partial data
        state.allbankAccounts = state.allbankAccounts.map(account =>
          account._id === _id ? { ...account, ...restOfAccount } : account
        );
        
        state.error = null;
      })
      .addCase(editBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update bank account";
      })
      .addCase(fetchAllBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.allbankAccounts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bank accounts";
      })
      .addCase(BankAccountStatusChange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(BankAccountStatusChange.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific bank account in the state
        const updatedAccount = action.payload.data;
        
        // Make all other accounts' isActive false
        state.allbankAccounts = state.allbankAccounts.map((account) =>
            account._id === updatedAccount._id 
            ? updatedAccount // Update the specific account
            : { ...account, isActive: false } // Set isActive to false for other accounts
        );
    
        state.error = null;
    })
      .addCase(BankAccountStatusChange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update bank account status";
      });
  },
});

// Export Reducer
export default bankAccountsSlice.reducer;
