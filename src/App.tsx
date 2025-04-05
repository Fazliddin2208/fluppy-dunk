import {Provider} from "react-redux";
import "./App.css";
import "./assets/style.css";
import Game from "./components/Game";
import {store} from "./components/store";
import FlappyDunk from "./components/FluppyDunk";
import Flappy3D from "./components/Flupp3d";
import FlappyDunk2 from "./components/FluppyPixi";
import FlappyDunkMatter from "./components/Matter";
import FlappyDunkPhaser from "./components/FlappyDunkPhaser";

function App() {
  return (
    <>
      <Provider store={store}>
        {/* <Game /> */}
        {/* <FlappyDunk /> */}
        {/* <Flappy3D /> */}
        {/* <FlappyDunk2 /> */}
        {/* <FlappyDunkMatter /> */}

        <FlappyDunkPhaser />
      </Provider>
    </>
  );
}

export default App;
