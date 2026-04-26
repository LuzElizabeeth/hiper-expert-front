import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Home } from '../pages/Home';
import { Evaluation } from '../pages/Evaluation';
import { Result } from '../pages/Result';
import { History } from '../pages/History';
import { Profile } from '../pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'evaluacion',
        element: <Evaluation />,
      },
      {
        path: 'resultado',
        element: <Result />,
      },
      {
        path: 'historial',
        element: <History />,
      },
      {
        path: 'perfil',
        element: <Profile />,
      },
    ],
  },
]);