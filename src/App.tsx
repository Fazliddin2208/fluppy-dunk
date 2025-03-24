import {Provider} from "react-redux";
import "./App.css";
import './assets/style.css'
import Game from "./components/Game";
import {store} from "./components/store";
import FlappyDunk from "./components/FluppyDunk";

function App() {
    return (
        <>
            <Provider store={store}>
                {/* <Game /> */}
                <FlappyDunk />
            </Provider>
        </>
    );
}

export default App;
