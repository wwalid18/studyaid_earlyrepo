import Login from './pages/Login';
import Signup from './pages/Signup';
import Highlights from './pages/Highlights';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

const routes = {
  login: Login,
  signup: Signup,
  highlights: Highlights,
  forgot: ForgotPassword,
  changepassword: ChangePassword,
};

export const Router = ({ route, onRouteChange, onLogout }: { route: keyof typeof routes, onRouteChange: (route: string) => void, onLogout?: () => void }) => {
  if (route === 'highlights') {
    return <Highlights onRouteChange={onRouteChange} onLogout={onLogout} />;
  }
  const Page = routes[route] || Login;
  return <Page onRouteChange={onRouteChange} />;
};
