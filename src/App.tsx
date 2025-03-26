import {Provider} from "react-redux";
import "./App.css";
import './assets/style.css'
import Game from "./components/Game";
import {store} from "./components/store";
import FlappyDunk from "./components/FluppyDunk";
import Flappy3D from "./components/Flupp3d";

function App() {
    return (
        <>
            <Provider store={store}>
                {/* <Game /> */}
                {/* <FlappyDunk /> */}
                <Flappy3D />
            </Provider>
        </>
    );
}

export default App;
