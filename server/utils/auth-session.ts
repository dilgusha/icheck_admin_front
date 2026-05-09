import { getCookie, setCookie, deleteCookie } from "h3";

const ACCESS_TOKEN_KEY = "icheck_access";
const REFRESH_TOKEN_KEY = "icheck_refresh";

export const setAuthCookies = (event: any, access: string, refresh: string) => {
setCookie(event, ACCESS_TOKEN_KEY, access, {
  secure: false,      
  sameSite: 'strict',
  maxAge: 60 * 60,
  httpOnly: false,  
})

setCookie(event, REFRESH_TOKEN_KEY, refresh, {
  httpOnly: true,
  secure: false,     
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30,
})
};

export const getAccessToken = (event: any): string | undefined => {
  return getCookie(event, ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (event: any): string | undefined => {
  return getCookie(event, REFRESH_TOKEN_KEY);
};

export const clearAuthCookies = (event: any) => {
  deleteCookie(event, ACCESS_TOKEN_KEY);
  deleteCookie(event, REFRESH_TOKEN_KEY);
};

export const requireAuth = (event: any): string => {
  const token = getAccessToken(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Login required",
    });
  }
  return token;
};
