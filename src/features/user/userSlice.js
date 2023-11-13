import { getAddress } from "../../services/apiGeocoding";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

const initialState = {
  username: '',
  status: "idle",
  position: {},
  address: "",
  error: ""
};

// RDK way of creating a thunk function 
// fetchAddress is the action creator function we need to dispatch
export const fetchAddress = createAsyncThunk(
  "user/fetchAddress", // action name
  async function () {
   // 1) We get the user's geolocation position
   const positionObj = await getPosition();
   const position = {
     latitude: positionObj.coords.latitude,
     longitude: positionObj.coords.longitude,
   };
 
   // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
   const addressObj = await getAddress(position);
   const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;
 
   // 3) Then we return an object with the data that we are interested in
   // payload of the fulfilled state
   return { position, address };
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  // three states for fetchAddress pending, fulfilled, rejected
  extraReducers: (builder) => builder.addCase(fetchAddress.pending, (state, action) => {
    state.status = "loading"
  })
  .addCase(fetchAddress.fulfilled, (state, action) => {
    state.position = action.payload.position;
    state.address = action.payload.address;
    state.status = "idle";
  })
  .addCase(fetchAddress.rejected, (state, action) => {
    state.status = "error";
    state.error = "There was a problem getting your address, make sure to fill this field";
  })

});

export const { updateName } = userSlice.actions;
export default userSlice.reducer;
