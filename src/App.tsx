import { useRoutes } from 'react-router-dom';
import routers from './App/routers/routers';

const App = () => {
    const element = useRoutes(routers);

    return element;
};

export default App;
