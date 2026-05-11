import { requireAuth } from "../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const token = requireAuth(event);

  try {
    return await $fetch("https://icheckapi.200soft.com/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 401,
      statusMessage: err?.data?.detail || "User məlumatı yüklənmədi.",
    });
  }
});
