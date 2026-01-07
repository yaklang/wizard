import { useRoutes } from 'react-router-dom';
import routers from './App/routers/routers';
import "@yakit-libs/color/dist/index.css";
const App = () => {
    const element = useRoutes(routers);

    return element;
};

export default App;
