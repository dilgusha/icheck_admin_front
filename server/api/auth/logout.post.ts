import { getRefreshToken, clearAuthCookies } from "../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const refresh = getRefreshToken(event);

  try {
    if (refresh) {
      await $fetch("https://icheckapi.200soft.com/auth/logout/", {
        method: "POST",
        body: { refresh },
      });
    }

    clearAuthCookies(event);

    return { success: true };
  } catch (err: any) {
    clearAuthCookies(event);

    throw createError({
      statusCode: err?.response?.status || 400,
      statusMessage: err?.data?.detail || "Logout zamanı xəta baş verdi.",
    });
  }
});
