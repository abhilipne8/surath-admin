import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async action to fetch the token for starting the stream
export const fetchStreamToken = createAsyncThunk(
  'stream/fetchToken',
  async (channelName, { rejectWithValue }) => {
    try {
      const response = await api.get('agora/get-admin-token');
      if (response.status !== 200) {
        throw new Error('Failed to fetch token');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state for the stream slice
const initialState = {
  isStreaming: false,
  token: null,
  error: null,
  loading: false,
  isPaused: false,
  uid: null
};

// Stream slice definition
const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    startStreaming: (state) => {
      state.isStreaming = true;
      state.error = null;
    },
    stopStreaming: (state) => {
      state.isStreaming = false;
      state.token = null;
      state.error = null;
    },
    pauseStream: (state) => {
      state.isPaused = true;
    },
    resumeStream: (state) => {
      state.isPaused = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreamToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStreamToken.fulfilled, (state, action) => {
        console.info('Admin Live =>', action.payload);
        state.loading = false;
        state.token = action.payload.token;
        state.uid = action.payload.uid

        state.isStreaming = true; // Assuming stream starts when token is fetched
      })
      .addCase(fetchStreamToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { startStreaming, stopStreaming, pauseStream, resumeStream } = streamSlice.actions;

// Export reducer
export default streamSlice.reducer;
