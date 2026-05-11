<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Profile
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage your account information.
        </p>
      </div>
    </div>

    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl bg-white max-w-2xl"
    >
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-5">
          <div
            class="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center"
          >
            <img
              v-if="form.avatar_url"
              :src="form.avatar_url"
              alt="avatar"
              class="w-full h-full object-cover"
            />
            <UserRound v-else :size="34" class="text-slate-400" />
          </div>

          <div class="flex gap-3">
            <n-upload
              :show-file-list="false"
              accept="image/*"
              :custom-request="handleAvatarUpload"
            >
              <n-button type="primary" ghost> Upload Avatar </n-button>
            </n-upload>

            <n-button
              v-if="form.avatar_url"
              type="error"
              ghost
              @click="handleDeleteAvatar"
            >
              Delete
            </n-button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <n-form-item label="Full name">
            <n-input v-model:value="form.fullname" size="large" />
          </n-form-item>

          <n-form-item label="Phone">
            <n-input v-model:value="form.phone" size="large" />
          </n-form-item>

          <n-form-item label="Birthday">
            <n-date-picker
              v-model:formatted-value="form.birthday"
              value-format="yyyy-MM-dd"
              type="date"
              size="large"
              clearable
              class="w-full"
            />
          </n-form-item>

          <n-form-item label="Gender">
            <n-select
              v-model:value="form.gender"
              :options="genderOptions"
              size="large"
              clearable
            />
          </n-form-item>
        </div>

        <div class="flex justify-end">
          <n-button
            type="primary"
            size="large"
            :loading="saving"
            @click="handleSave"
          >
            Save Changes
          </n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { UserRound } from "lucide-vue-next";
import { useMessage } from "naive-ui";

const message = useMessage();

const saving = ref(false);

const { data: currentUser, refresh } = await useFetch<any>("/api/auth/me", {
  key: "current-user",
});

const form = reactive({
  fullname: "",
  phone: "",
  birthday: null as string | null,
  gender: null as string | null,
  avatar_url: null as string | null,
});

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

watch(
  currentUser,
  (value) => {
    const user = value?.data;
    if (!user) return;

    form.fullname = user.fullname ?? "";
    form.phone = user.phone ?? "";
    form.birthday = user.birthday ?? null;
    form.gender = user.gender ?? null;
    form.avatar_url = user.avatar_url ?? null;
  },
  { immediate: true }
);

const handleSave = async () => {
  saving.value = true;

  try {
    await $fetch("/api/auth/me", {
      method: "PATCH",
      body: {
        fullname: form.fullname,
        phone: form.phone || null,
        birthday: form.birthday,
        gender: form.gender,
      },
    });

    await refresh();
    message.success("Profile updated");
  } catch {
    message.error("Profile update failed");
  } finally {
    saving.value = false;
  }
};

const handleAvatarUpload = async ({ file, onFinish, onError }: any) => {
  if (!file?.file) {
    message.error("Fayl seçilməyib");
    onError?.();
    return;
  }

  const formData = new FormData();
  formData.append("file", file.file);

  try {
    await $fetch("/api/auth/me/avatar", {
      method: "POST",
      body: formData,
    });

    await refresh();
    message.success("Avatar yeniləndi");
    onFinish?.();
  } catch (err: any) {
    message.error(
      err?.data?.message || err?.statusMessage || "Avatar yüklənmədi"
    );
    onError?.();
  }
};

const handleDeleteAvatar = async () => {
  try {
    await $fetch("/api/auth/me/avatar", {
      method: "DELETE",
    });

    form.avatar_url = null;
    await refresh();
    message.success("Avatar deleted");
  } catch {
    message.error("Avatar delete failed");
  }
};
</script>
