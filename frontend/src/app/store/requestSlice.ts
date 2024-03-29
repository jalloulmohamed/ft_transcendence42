import {  createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
	AcceptRequest,

	SendRequest,
	acceptRequestToPlay,

	getNumberPending,
	getRequest,
	refusePLayRequest,
	refuseRequest,
	sendRequestPlay,
} from "../utils/api";
import {
	
	CreateRequestParams,

	RequestTypes,
	
} from "../utils/types";

export interface requestState {
	request: RequestTypes[];
	countRequest: number;
	status: "success" | "failed" | "idle" | "loading"; // Add 'idle' status
	error: string | null;
}

const initialState: requestState = {
	request: [],
	countRequest: 0,
	status: "idle", // Initial status is 'idle'
	error: null,
};

export const fetchGetRequestThunk = createAsyncThunk(
	"request/fetchGetRequestThunk",
	async (_, { rejectWithValue }) => {
		try {
			const response = await getRequest();
			return response.data.data;
		} catch (error: any) {
			if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				return rejectWithValue(error.response.data.message);
			} else {
				return rejectWithValue("Failed to fetch requests");
			}
		}
	},
);

export const fetchRequestThunk = createAsyncThunk(
	"request/create",
	async (data: CreateRequestParams, { rejectWithValue }) => {
		try {
			const response = await SendRequest(data.display_name);
			
			return response.data; 
		} catch (err: any) {
			if (err.response && err.response.data) {
				return rejectWithValue(err.response.data); 
			} else {
				throw new Error("create conversation failed with an unknown error");
			}
		}
	},
);

export const fetchAcceptFriendRequestThunk = createAsyncThunk("request/accept",async (id: string, { rejectWithValue }) => {
	try{
		const response = await AcceptRequest(id);
	
		return response.data;
	} catch (err: any) {
		if (err.response && err.response.data) {
			return rejectWithValue(err.response.data); 
		} else {
			throw new Error("create conversation failed with an unknown error");
		}
	}
		
	},
);

export const fetchREfuseFriendRquestThunk = createAsyncThunk(
	"request/refuse",
	async (id: string) => {
		const response = await refuseRequest(id);
		return response;
	},
);

export const fetchNumberPending = createAsyncThunk(
	"request/pendingCount",
	async (_, { rejectWithValue }) => {
		const response = await getNumberPending();
		return response.data;
	},
);

export const fetchSendRequestPLay = createAsyncThunk(
	"request/send",
	async (display_name: string, { rejectWithValue }) => {
		try {
			const response = await sendRequestPlay(display_name);

			
			return response.data;
		} catch (err: any) {
			if (err.response && err.response.data) {
				return rejectWithValue(err.response.data);
			} else {
				throw new Error("create conversation failed with an unknown error");
			}
		}
	},
);

export const fetchAcceptRequestPlay = createAsyncThunk(
	"request/accept",
	async (requestId: string) => {
		const response = await acceptRequestToPlay(requestId);
		return response;
	},
);

export const fetchRefuseRequestPlay = createAsyncThunk(
	"request/refuse",
	async (requestId: string) => {
		const response = await refusePLayRequest(requestId);
		return response;
	},
);

export const requestSlice = createSlice({
	name: "request",
	initialState,
	reducers: {
		addRequest: (state) => {},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchRequestThunk.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchRequestThunk.fulfilled, (state, action) => {
				state.status = "success";
			})
			.addCase(fetchRequestThunk.rejected, (state, action) => {
				state.status = "failed";
			})

			.addCase(fetchGetRequestThunk.pending, (state: any) => {
				state.status = "loading";
			})
			.addCase(fetchGetRequestThunk.fulfilled, (state, action) => {
				state.status = "success";
				state.request = action.payload;
			})
			.addCase(fetchGetRequestThunk.rejected, (state: any, action) => {
				state.status = "failed";
				state.error = action.payload;
			})
			.addCase(fetchAcceptFriendRequestThunk.fulfilled, (state, action) => {})
			.addCase(fetchSendRequestPLay.pending, (state: any) => {
				state.status = "loading";
			})
			.addCase(fetchSendRequestPLay.fulfilled, (state, action) => {
				state.status = "success";
			})
			.addCase(fetchSendRequestPLay.rejected, (state: any, action) => {
				state.status = "failed";
			})
			.addCase(fetchAcceptRequestPlay.pending, (state: any) => {
				state.status = "loading";
			})
			.addCase(fetchRefuseRequestPlay.pending, (state: any) => {
				state.status = "loading";
			})
			.addCase(fetchNumberPending.pending, (state: any, action) => {
				state.status = "loading";
			})
			.addCase(fetchNumberPending.fulfilled, (state: any, action) => {
				state.status = "success";
				state.countRequest = action.payload;
			})
			.addCase(fetchNumberPending.rejected, (state: any) => {
				state.status = "failed";
			});
	},
});

export const { addRequest } = requestSlice.actions;

export default requestSlice.reducer;