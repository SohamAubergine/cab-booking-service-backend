import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  UserRole,
} from "../types";
import { authService } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate that a user object has a valid role
  const validateUserRole = (user: User): boolean => {
    return Object.values(UserRole).includes(user.role);
  };

  // Process and store user data
  const processAndStoreUser = (userData: User, authToken: string) => {
    if (!validateUserRole(userData)) {
      console.error("Invalid user role detected:", userData.role);
      console.log("Valid roles are:", Object.values(UserRole));
      // Ensure the role is one of the valid enum values
      userData.role = userData.role as UserRole;
    }

    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    console.log("User authenticated with role:", userData.role);
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;

        if (validateUserRole(parsedUser)) {
          setToken(storedToken);
          setUser(parsedUser);
          console.log(
            "Restored authentication for user with role:",
            parsedUser.role
          );
        } else {
          console.error("Invalid user role in stored data:", parsedUser.role);
          // Force logout if stored role is invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(data);

      if (response.success && response.data) {
        const { user, token } = response.data;
        processAndStoreUser(user, token);
        return { user, token };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to login";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(data);

      if (response.success) {
        // After registration, proceed to login
        await login({ email: data.email, password: data.password });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
