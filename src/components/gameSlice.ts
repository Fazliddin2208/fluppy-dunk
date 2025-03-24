import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface GameState {
    ballPosition: {x: number; y: number};
}

const initialState: GameState = {
    ballPosition: {x: 200, y: 300},
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        updateBallPosition: (state, action: PayloadAction<{x: number; y: number}>) => {
            state.ballPosition = action.payload;
        },
    },
});

export const {updateBallPosition} = gameSlice.actions;
export default gameSlice.reducer;
