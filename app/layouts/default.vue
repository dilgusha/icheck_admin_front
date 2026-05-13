<template>
  <div class="flex h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
    <!-- Sidebar -->
    <aside
      class="bg-[#0f172a] text-white transition-all duration-300 flex flex-col overflow-hidden z-30"
      :class="[isCollapsed ? 'w-20' : 'w-72']"
    >
      <!-- Sidebar Header -->
      <div class="p-3 flex flex-col gap-1 border-b border-white/5 bg-[#0f172a]">
        <div class="flex items-center justify-center gap-3">
          <div class="w-14 h-10">
            <NuxtImg
              src="/iCheck-logo.webp"
              alt="Logo"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- <div v-if="!isCollapsed" class="flex flex-col"> -->
          <!-- <span
              class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Admin Panel</span> -->
          <!-- </div> -->
        </div>
        <div
          v-if="!isCollapsed"
          class="mt-6 px-1 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"
        >
          <div
            class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"
          >
            <UserRound :size="18" />
          </div>
          <div class="flex flex-col min-w-0">
            <p
              class="text-[10px] text-white/40 uppercase font-bold tracking-wider"
            >
              Current User
            </p>

            <p class="text-sm font-semibold truncate max-w-40">
              {{ currentUser?.data?.fullname || "Admin" }}
            </p>

            <p class="text-[11px] text-white/40 truncate max-w-40 capitalize">
              {{ currentUser?.data?.role || "user" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sidebar Menu -->
      <div
        class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar"
      >
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center rounded-xl transition-all duration-200 group relative py-3"
          :class="[
            // Sidebar bağlıdırsa mərkəzə yığırıq, açıqdırsa sola və boşluq veririk
            isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3.5',

            route.path === item.path
              ? 'bg-[#4F46E5] text-white shadow-xl shadow-indigo-500/30'
              : 'text-slate-400 hover:bg-white/5 hover:text-white',
          ]"
        >
          <component
            :is="item.icon"
            :size="isCollapsed ? 22 : 20"
            :stroke-width="2.5"
            class="transition-all duration-200"
          />

          <span
            v-if="!isCollapsed"
            class="text-[14px] font-semibold tracking-wide whitespace-nowrap"
          >
            {{ item.label }}
          </span>

          <div
            v-if="route.path === item.path && !isCollapsed"
            class="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
          ></div>
        </NuxtLink>
      </div>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-white/5">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut :size="20" :stroke-width="2.5" />
          <span v-if="!isCollapsed" class="text-sm font-bold tracking-wide">
            Logout Session
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Top Header (Glassmorphism) -->
      <header
        class="h-20 backdrop-blur-md bg-white/70 border-b border-slate-200 flex items-center justify-between px-8 z-20 sticky top-0"
      >
        <div class="flex items-center gap-6">
          <button
            @click="isCollapsed = !isCollapsed"
            class="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 border border-slate-200 shadow-sm"
          >
            <Menu v-if="isCollapsed" :size="20" />
            <ArrowLeftToLine v-else :size="20" />
          </button>
          <div class="flex flex-col">
            <h1
              class="text-xl font-bold text-slate-800 capitalize leading-none"
            >
              {{ currentTitle }}
            </h1>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-[11px] text-slate-400 font-medium"
                >Dashboard</span
              >
              <ChevronRight :size="12" class="text-slate-300" />
              <span class="text-[11px] text-indigo-500 font-bold capitalize">{{
                currentTitle
              }}</span>
            </div>
          </div>
        </div>
        <div
          class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200"
        >
          <button
            v-for="lang in ['az', 'en', 'ru']"
            :key="lang"
            @click="setLanguage(lang)"
            class="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all duration-200"
            :class="{
              'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50':
                currentLang === lang,
              'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50':
                currentLang !== lang,
            }"
          >
            {{ lang }}
          </button>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100/50"
          >
            <div
              class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-sm shadow-indigo-500"
            ></div>
            <span
              class="text-[11px] font-bold text-indigo-600 uppercase tracking-widest"
              >Systems Active</span
            >
          </div>

          <div
            class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200"
          >
            <button
              class="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"
            >
              <Search :size="18" />
            </button>
            <button
              class="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 relative"
            >
              <Bell :size="18" />
              <span
                class="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"
              ></span>
            </button>
          </div>

          <NuxtLink
            to="/profile"
            class="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden group cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/20 transition-all"
          >
            <img
              v-if="currentUser?.data?.avatar_url"
              :src="currentUser.data.avatar_url"
              alt="avatar"
              class="w-full h-full object-cover"
            />
            <img
              v-else
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="avatar"
              class="w-full h-full object-cover"
            />
          </NuxtLink>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto p-8 bg-[#f8fafc]/50">
        <div class="max-w-[1600px] mx-auto">
          <!-- <Transition name="fade" mode="out-in">
            <div :key="route.path">
              <slot />
            </div>
          </Transition> -->
          <NuxtErrorBoundary :key="route.fullPath">
  <Transition name="fade" mode="out-in">
    <div :key="route.fullPath">
      <slot />
    </div>
  </Transition>

  <template #error="{ error, clearError }">
    <div class="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-extrabold text-slate-900">
        Səhifə yüklənmədi
      </h2>

      <p class="mt-2 text-sm text-slate-500">
        Bu bölmədə xəta baş verdi. Sol menyudan başqa bölməyə keçə bilərsiniz.
      </p>

      <pre class="mt-4 max-h-48 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-red-100">{{ error?.message }}</pre>

      <div class="mt-4 flex gap-3">
        <n-button
          type="primary"
          @click="clearError"
        >
          Yenidən yoxla
        </n-button>

        <n-button
          secondary
          @click="clearError(); navigateTo('/')"
        >
          Dashboard
        </n-button>
      </div>
    </div>
  </template>
</NuxtErrorBoundary>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  MapPin,
  Hospital,
  UserRound,
  Stethoscope,
  Activity,
  Accessibility,
  Bone,
  Briefcase,
  ClipboardCheck,
  Pill,
  FileText,
  Calendar,
  Star,
  MessageSquare,
  Bell,
  BarChart3,
  ScrollText,
  Megaphone,
  HelpCircle,
  LogOut,
  Menu,
  ArrowLeftToLine,
  ChevronRight,
  Search,
} from "lucide-vue-next";
const { t } = useI18n();

const route = useRoute();
const isCollapsed = ref(false);
const { setLocale } = useI18n();

const langCookie = useCookie<"az" | "en" | "ru">("lang", {
  default: () => "az",
});

const currentLang = computed(() => langCookie.value);

const { data: currentUser, refresh: refreshCurrentUser } = await useFetch<any>(
  "/api/auth/me",
  {
    key: "current-user",
  }
);

const setLanguage = async (lang: "az" | "en" | "ru") => {
  langCookie.value = lang;

  await setLocale(lang);

  await refreshNuxtData();
};

const handleLogout = async () => {
  await $fetch("/api/auth/logout", {
    method: "POST",
  }).catch(() => null);

  await navigateTo("/login");
};

const currentTitle = computed(() => {
  const path = route.path.split("/")[1] || "Dashboard";
  return path.replace(/-/g, " ");
});

const menuItems = [
  { label: "Profile", path: "/profile", icon: UserRound },

  { label: "Regions", path: "/regions", icon: MapPin },
  { label: "Clinics", path: "/clinics", icon: Hospital },
  { label: "Doctors", path: "/doctors", icon: UserRound },
  { label: "Specialisations", path: "/specializations", icon: Stethoscope },
  { label: "Diseases", path: "/diseases", icon: Activity },
  { label: "Symptoms", path: "/symptoms", icon: Accessibility },
  { label: "Services", path: "/services", icon: Briefcase },
  // { label: "Diagnosis", path: "/diagnosis", icon: ClipboardCheck },
  { label: "Drugs", path: "/drugs", icon: Pill },
  // { label: "Prescriptions", path: "/prescriptions", icon: FileText },
  { label: "Appointments", path: "/appointments", icon: Calendar },
  { label: 'Forum', path: '/forum', icon: MessageSquare },
  { label: 'Content', path: '/content', icon: FileText },
  { label: 'Faq', path: '/faq', icon: HelpCircle },
  { label: 'Pages', path: '/pages', icon: FileText },
  {
    label: "Users",
    path: "/users",
    icon: UserRound,
    permission: "users.view_user",
  },
  // { label: "Users", path: "/users", icon: UserRound},
  // { label: "Reviews", path: "/reviews", icon: Star },
  // { label: "Forum", path: "/forum", icon: MessageSquare },
  // { label: "Notifications", path: "/notifications", icon: Bell },
  // { label: "Finance", path: "/finance", icon: BarChart3 },
  // { label: "Logs", path: "/logs", icon: ScrollText },
  // { label: "Advertising", path: "/advertising", icon: Megaphone },
  // { label: "FAQ", path: "/faq", icon: HelpCircle },
];

// const { clear } = useUserSession();
const hasPermission = (permissionCode: string) => {
  const user = currentUser.value;
  if (!user) return false;
  if (user.is_superuser) return true;

  return (
    user.user_permissions?.includes(permissionCode) ||
    user.permissions?.includes(permissionCode)
  );
};

const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
</style>

