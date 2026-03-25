import { useRoutes } from 'react-router-dom';
import routers from './App/routers/routers';
import irifyRouters from './App/routers/irify-routers';
// import '@yakit-libs/color/dist/index.css';
import './styles/index.css';

const APP_MODE = import.meta.env.VITE_APP_MODE;

const App = () => {
    const element = useRoutes(APP_MODE === 'irify' ? irifyRouters : routers);

    return element;
};

export default App;
