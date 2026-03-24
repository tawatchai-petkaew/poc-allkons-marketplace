export interface AuthSession {
  user: {
    accessToken: string;
    authCenter: {
      accessToken: string;
      expiresIn: string;
      refreshExpiresIn: number;
      refreshToken: string;
    };
  };
}

export interface AuthContextType {
  userSession: AuthSession["user"] | null;
  loading: boolean;
  setSession: (
    authData: {
      accessToken: string;
      authCenter: {
        accessToken: string;
        expiresIn: string;
        refreshExpiresIn: number;
        refreshToken: string;
      };
    },
    userProfileData: any,
  ) => Promise<void>;
  logout: () => Promise<void>;
  getSession: () => Promise<void>;
}
