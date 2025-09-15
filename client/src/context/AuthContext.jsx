import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'INITIALIZE':
            return {
                ...state,
                isAuthenticated: !!action.payload.user,
                user: action.payload.user,
                loading: false,
            };
        case 'LOGIN':
            return { ...state, isAuthenticated: true, user: action.payload.user };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false, user: null };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        isAuthenticated: false,
        user: null,
        loading: true,
    });

    useEffect(() => {
        const initialize = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                try {
                    const response = await axios.get("/api/auth/me");
                    dispatch({ type: 'INITIALIZE', payload: { user: response.data.user } });
                } catch (error) {
                    localStorage.removeItem("token");
                    dispatch({ type: 'INITIALIZE', payload: { user: null } });
                }
            } else {
                dispatch({ type: 'INITIALIZE', payload: { user: null } });
            }
        };
        initialize();
    }, []);

    const login = async (credentials) => {
        const response = await axios.post("/api/auth/login", credentials);
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN', payload: { user } });
        return user;
    };

    const adminLogin = async (credentials) => {
        const response = await axios.post("/api/auth/admin-login", credentials);
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN', payload: { user } });
        return user;
    };

    const register = async (userData) => {
        const response = await axios.post("/api/auth/register", userData);
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN', payload: { user } });
        return user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        dispatch({ type: 'LOGOUT' });
    };

    const updateUser = (userData) => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, adminLogin, register, logout, updateUser }}>
            {state.loading ? (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);