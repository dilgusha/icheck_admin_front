// server/api/auth/me/avatar.post.ts
import { requireAuth } from "../../../utils/auth-session";

export default defineEventHandler(async (event) => {
  const token = requireAuth(event);
  const files = await readMultipartFormData(event);

  const file = files?.find((item) => item.name === "file");

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: "Avatar faylı göndərilməyib.",
    });
  }

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([file.data], { type: file.type || "image/png" }),
    file.filename || "avatar.png"
  );

  try {
    return await $fetch("https://icheckapi.200soft.com/me/avatar/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 400,
      statusMessage:
        err?.data?.detail ||
        JSON.stringify(err?.data) ||
        "Avatar upload zamanı xəta baş verdi.",
    });
  }
});
