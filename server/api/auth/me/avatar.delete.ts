import { requireAuth } from "../../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const token = requireAuth(event);

  return await $fetch("https://icheckapi.200soft.com/me/avatar/", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
