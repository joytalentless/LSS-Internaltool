import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// third-party
import jwtDecode from 'jwt-decode';
import { useDispatch } from 'store';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';

// constant
const initialState = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};

const verifyToken = (serviceToken) => {
    if (!serviceToken) {
        return false;
    }
    const decoded = jwtDecode(serviceToken);
    /**
     * Property 'exp' does not exist on type '<T = unknown>(token, options?: JwtDecodeOptions | undefined) => T'.
     */
    return decoded.exp > Date.now() / 1000;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp) => {
    // eslint-disable-next-line prefer-const
    let expiredTimer;

    const currentTime = Date.now();

    // Test token expires after 10s
    // const timeLeft = currentTime + 10000 - currentTime; // ~10s
    const expirationDate = new Date(exp * 1000);
    const timeLeft = expirationDate < new Date() ? 5000 : (expirationDate - new Date()) / 30;

    clearTimeout(expiredTimer);

    expiredTimer = setTimeout(() => {
        console.log('Token expired');

        localStorage.removeItem('serviceToken');

        window.location.href = '/login';
    }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (serviceToken) => {
    if (serviceToken) {
        localStorage.setItem('serviceToken', serviceToken);

        axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;

        // This function below will handle when token is expired
        const { exp } = jwtDecode(serviceToken); // ~3 days by minimals server
        tokenExpired(exp);
    } else {
        localStorage.removeItem('serviceToken');

        delete axios.defaults.headers.common.Authorization;
    }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //
const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [userState, userDispatch] = useReducer(accountReducer, initialState);

    useEffect(() => {
        const init = async () => {
            try {
                const serviceToken = window.localStorage.getItem('serviceToken');

                if (serviceToken && verifyToken(serviceToken)) {
                    const userData = jwtDecode(serviceToken);
                    setSession(serviceToken);
                    const response = await axios.get(`/users/${userData.user_id}/`);
                    const user = response.data;

                    userDispatch({
                        type: LOGIN,
                        payload: {
                            isLoggedIn: true,
                            user
                        }
                    });
                } else {
                    userDispatch({
                        type: LOGOUT
                    });
                }
            } catch (err) {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch user data is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
                userDispatch({
                    type: LOGOUT
                });
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/users/signin/', { email, password });
            const { tokenObj } = response.data;
            setSession(tokenObj.access);
            const userData = await axios.get(`/users/${response.data.user.id}/`);
            const user = userData.data;

            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Login succeeded!',
                    variant: 'alert'
                })
            );
            userDispatch({
                type: LOGIN,
                payload: {
                    isLoggedIn: true,
                    user
                }
            });
        } catch (err) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: err?.error || 'Login failed!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const register = async (email, password, firstName, lastName) => {
        // todo: this flow need to be recode as it not verified
        try {
            await axios.post('/users/signup/', {
                email,
                password,
                username: `${firstName} ${lastName}`,
                first_name: firstName,
                last_name: lastName
            });

            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Register succeeded!',
                    variant: 'alert'
                })
            );
        } catch (err) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Register failed!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
            throw new Error(err);
        }
    };

    const logout = () => {
        setSession(null);
        userDispatch({ type: LOGOUT });
    };

    const resetPassword = (email) => console.log(email);

    const updateProfile = () => {};

    if (userState.isInitialized !== undefined && !userState.isInitialized) {
        return <Loader />;
    }

    return (
        <JWTContext.Provider value={{ ...userState, login, logout, register, resetPassword, updateProfile }}>
            {children}
        </JWTContext.Provider>
    );
};

JWTProvider.propTypes = {
    children: PropTypes.node
};

export default JWTContext;
