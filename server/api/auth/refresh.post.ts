import type { TokenPair } from "@icheck/api-contracts";
import {
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const refresh = getRefreshToken(event);

  if (!refresh) {
    clearAuthCookies(event);

    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token tapılmadı.",
    });
  }

  try {
    const tokens = await $fetch<Partial<TokenPair>>(
      "https://icheckapi.200soft.com/auth/refresh/",
      {
        method: "POST",
        body: { refresh },
      }
    );

    if (!tokens.access) {
      clearAuthCookies(event);

      throw createError({
        statusCode: 401,
        statusMessage: "Refresh token etibarsızdır.",
      });
    }

    setAuthCookies(event, tokens.access, tokens.refresh ?? refresh);

    return { success: true };
  } catch (err: any) {
    clearAuthCookies(event);

    throw createError({
      statusCode: err?.response?.status || 401,
      statusMessage: err?.data?.detail || "Session müddəti bitib.",
    });
  }
});
