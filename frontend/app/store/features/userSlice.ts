import { createSlice } from '@reduxjs/toolkit';
/*
"user": {
            "id": 32,
            "name": "Soumik Bhattacharjee",
            "email": "aarebbus@gmail.com",
            "role": "USER",
            "dateOfBirth": "2025-08-01",
            "gender": "Male",
            "profileImageUrl": "https://zwlhrodyseoflrbasjye.supabase.co/storage/v1/object/public/mindigo-public/images/photo_2023-01-24_19-47-20_9536a2d0-391a-4748-a0ae-36ff7932dc2d.jpg",
            "createdAt": "2025-08-27T14:23:05.017787",
            "lastLoginAt": "2025-08-27T15:32:11.5094201",
            "emailVerified": true
        }
*/
// export interface User{
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   dateOfBirth: string;
//   gender: string;
//   profileImageUrl: string;
//   createdAt: string;
//   lastLoginAt: string;
//   emailVerified: boolean;
// }

export const userSlice = createSlice({
  name: 'counter',
  initialState: { user: null },
  reducers: {
    login_user: (state,action) => {
      state.user = action.payload;
    },
    logout_user: (state) => {
      state.user = null;
    },
  },
});

export const { login_user, logout_user } = userSlice.actions;

export default userSlice.reducer;