import {Provider} from "react-redux";
import "./App.css";
import "./assets/style.css";
import {store} from "./components/store";
import Flappy3D from "./components/Flupp3d";

function App() {
  return (
    <>
      <Provider store={store}>
        <Flappy3D />
      </Provider>
    </>
  );
}

export default App;
