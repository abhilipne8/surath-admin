import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async action to fetch the settings
export const fetchSurathSettings = createAsyncThunk(
  'surath/getSettings',
  async (_, { rejectWithValue }) => { // Fixed parameter destructuring
    try {
      const response = await api.get('admin/settings');
      if (response.status !== 200) {
        throw new Error('Failed to fetch settings');
      }
      return response.data; // Return the data payload
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message); // Improved error handling
    }
  }
);
export const gameModeChange = createAsyncThunk(
  'surath/changeSettings',
  async (mode, { rejectWithValue }) => { // Fixed parameter destructuring
    try {
      const response = await api.post('admin/set-session-mode',{mode: mode});
      if (response.status !== 200) {
        throw new Error('Failed to fetch settings');
      }
      return response.data; // Return the data payload
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message); // Improved error handling
    }
  }
);
export const drawResult = createAsyncThunk(
  'surath/draw-result',
  async (winningCard, { rejectWithValue }) => { // Fixed parameter destructuring
    try {
      const response = await api.post('admin/draw-result',{winningCard: winningCard});
      if (response.status !== 200) {
        throw new Error('Failed to fetch settings');
      }
      return response.data; // Return the data payload
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message); // Improved error handling
    }
  }
);

export const fetchSessionInfo = createAsyncThunk('game/fetchSessionInfo', async () => {
  const result = await api.get('/game/surath/current/session');
  return result.data.data;
});

export const fetchSessionbetAmount = createAsyncThunk('game/getSessionBets', async (sessionId, { rejectWithValue }) => {
  console.log("sessionId =>", sessionId)
  const result = await api.post('/admin/session/bets', { gameSessionId: sessionId});
  console.log("dataaaaaaa =>", result.data)
  return result.data;
});

export const fetchSurathAllSessions = createAsyncThunk('surath/all-sessions', async (sessionId, { rejectWithValue }) => {
  const result = await api.get('/admin/surath/all-sessions', { gameSessionId: sessionId});
  console.log("dataaaaaaa =>", result.data)
  return result.data;
});

// Initial state for the settings slice
const initialState = {
  settings: null, // Added a state to hold the fetched settings
  loading: false,
  error: null,
  resultLoading: false,
  sessionRemainder: null,
  endTime: null,
  sessionId: null
};

// Surath slice definition
const surathSlice = createSlice({
  name: 'surath',
  initialState,
  reducers: {
    // Define actions here if needed
    setEndTime: (state, action) => { // New reducer
      state.endTime = action.payload;
    },
    updateSessionId: (state, action) => { // New reducer
      console.log("Store =>", action.payload)
      state.sessionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurathSettings.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchSurathSettings.fulfilled, (state, action) => {
        console.info('Fetched Settings =>', action.payload);
        state.loading = false;
        state.settings = action.payload.data; // Update the state with fetched settings
      })
      .addCase(fetchSurathSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Capture the error message
      })
      .addCase(gameModeChange.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(gameModeChange.fulfilled, (state, action) => {
        console.info('change Settings =>', action.payload);
        state.loading = false;
        state.settings = action.payload.data; // Update the state with fetched settings
      })
      .addCase(gameModeChange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Capture the error message
      })
      .addCase(drawResult.pending, (state) => {
        state.resultLoading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(drawResult.fulfilled, (state, action) => {
        console.info('change Settings =>', action.payload);
        state.resultLoading = false;
        state.settings = action.payload.data; // Update the state with fetched settings
      })
      .addCase(drawResult.rejected, (state, action) => {
        state.resultLoading = false;
        state.error = action.payload; // Capture the error message
      })
      .addCase(fetchSessionInfo.pending, (state, action) => {
        state.loading = true
      })
      .addCase(fetchSessionInfo.fulfilled, (state, action) => {
        console.log("current =>", action.payload.sessionId)
        const endTime = new Date(action.payload.endTime).getTime(); // Store endTime as timestamp
        state.endTime = endTime;
        state.sessionRemainder = action.payload.sessionRemainder; 
        state.sessionId = action.payload.sessionId
        state.loading = false

      })
      .addCase(fetchSessionInfo.rejected, (state, action) => {
        state.loading = false
      })
      .addCase(fetchSessionbetAmount.fulfilled, (state, action) => {
        state.loading = false
      })
  },
});

export const { setEndTime, updateSessionId } = surathSlice.actions;

// Export reducer
export default surathSlice.reducer;
