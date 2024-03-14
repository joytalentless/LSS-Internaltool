import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

// project imports
import GuestGuard from 'utils/route-guard/GuestGuard';
import NavMotion from 'layout/NavMotion';
import Loadable from 'ui-component/Loadable';

// login routing
const AuthLogin = Loadable(lazy(() => import('views/authentication/authentication3/Login3')));
const AuthRegister = Loadable(lazy(() => import('views/authentication/authentication3/Register3')));
const AuthForgotPassword = Loadable(lazy(() => import('views/authentication/authentication3/ForgotPassword3')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
    path: '/',
    element: (
        <NavMotion>
            <GuestGuard>
                <Outlet />
            </GuestGuard>
        </NavMotion>
    ),
    children: [
        {
            path: '/',
            element: <AuthLogin />
        },
        {
            path: '/login',
            element: <AuthLogin />
        },
        {
            path: '/register',
            element: <AuthRegister />
        },
        {
            path: '/forgot',
            element: <AuthForgotPassword />
        }
    ]
};

export default LoginRoutes;
