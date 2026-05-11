import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

import { Home } from '../pages/Home';
import { Evaluation } from '../pages/Evaluation';
import { Result } from '../pages/Result';
import { History } from '../pages/History';
import { Profile } from '../pages/Profile';
import { Medication } from '../pages/Medication';
import { MedicationsToday } from '../pages/MedicationsToday';
import { EmergencyContact } from '../pages/EmergencyContact';
import { Settings } from '../pages/Settings';
import { Configuration } from '../pages/Configuration';
import { ConfigurationProfile } from '../pages/ConfigurationProfile';
import { Alerts } from '../pages/Alerts';
import { GloboriskForm } from '../pages/GloboriskForm';
import { ActionConfirmation } from '../pages/ActionConfirmation';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
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
            path: 'alertas',
            element: <Alerts />,
          },
          {
            path: 'resultado',
            element: <Result />,
          },
          {
            path: 'medicacion',
            element: <MedicationsToday />,
          },
          {
            path: 'medicacion/nueva',
            element: <Medication />,
          },
          {
            path: 'historial',
            element: <History />,
          },
          {
            path: 'perfil',
            element: <Profile />,
          },
          {
            path: 'contacto-emergencia',
            element: <EmergencyContact />,
          },
          {
            path: 'configuracion',
            element: <Configuration />,
          },
          {
            path: 'configuracion/notificaciones',
            element: <Settings />,
          },
          {
            path: 'configuracion/perfil',
            element: <ConfigurationProfile />,
          },

          {
            path: 'globorisk',
            element: <GloboriskForm />,
          },
          {
            path: 'confirmacion/:type',
            element: <ActionConfirmation />,
          },
          

        ],
      },
    ],
  },
]);