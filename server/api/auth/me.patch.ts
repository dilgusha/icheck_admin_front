import { requireAuth } from "../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const token = requireAuth(event);
  const body = await readBody(event);

  return await $fetch("https://icheckapi.200soft.com/me/", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
});
