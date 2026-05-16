<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ t("ads.title") }}
        </h2>
      </div>

      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon>
          <Plus :size="20" :stroke-width="2.5" />
        </template>
        {{ t("ads.create") }}
      </n-button>
    </div>

    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex flex-wrap items-center gap-4 p-1">
        <n-select
          v-model:value="filterPlacement"
          :options="placementOptions"
          placeholder="Placement"
          size="large"
          clearable
          class="w-48"
        />

        <n-button
          quaternary
          circle
          size="medium"
          class="ml-auto"
          @click="refresh()"
        >
          <template #icon>
            <RefreshCw
              :size="18"
              :class="{ 'animate-spin': isLoading }"
              class="text-slate-500"
            />
          </template>
        </n-button>
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div
          v-for="i in 6"
          :key="i"
          class="h-12 bg-slate-50 rounded-lg animate-pulse"
        />
      </div>

      <n-alert v-else-if="error" type="error">{{
        t("ads.langLoadError")
      }}</n-alert>

      <n-data-table
        v-else
        :columns="columns"
        :data="ads"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
        :scroll-x="800"
      />
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingAd ? t('common.edit') : t('ads.create')"
      class="max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="p-2 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <n-tabs
          v-model:value="activeTab"
          type="segment"
          animated
          @update:value="handleTabChange"
        >
          <n-tab-pane name="az" tab="AZ">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item :label="t('ads.title')">
                <n-input
                  v-model:value="form.title.az"
                  size="large"
                  :placeholder="t('ads.titlePlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.body')">
                <n-input
                  v-model:value="form.body.az"
                  type="textarea"
                  :rows="3"
                  :placeholder="t('ads.bodyPlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.buttonText')">
                <n-input
                  v-model:value="form.button_text.az"
                  size="large"
                  :placeholder="t('ads.buttonTextPlaceholder')"
                />
              </n-form-item>
            </div>
          </n-tab-pane>

          <n-tab-pane name="en" tab="EN">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item :label="t('ads.title')">
                <n-input
                  v-model:value="form.title.en"
                  size="large"
                  :placeholder="t('ads.titlePlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.body')">
                <n-input
                  v-model:value="form.body.en"
                  type="textarea"
                  :rows="3"
                  :placeholder="t('ads.bodyPlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.buttonText')">
                <n-input
                  v-model:value="form.button_text.en"
                  size="large"
                  :placeholder="t('ads.buttonTextPlaceholder')"
                />
              </n-form-item>
            </div>
          </n-tab-pane>

          <n-tab-pane name="ru" tab="RU">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item :label="t('common.title')">
                <n-input
                  v-model:value="form.title.ru"
                  size="large"
                  :placeholder="t('ads.titlePlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.body')">
                <n-input
                  v-model:value="form.body.ru"
                  type="textarea"
                  :rows="3"
                  :placeholder="t('ads.bodyPlaceholder')"
                />
              </n-form-item>
              <n-form-item :label="t('ads.buttonText')">
                <n-input
                  v-model:value="form.button_text.ru"
                  size="large"
                  :placeholder="t('ads.buttonTextPlaceholder')"
                />
              </n-form-item>
            </div>
          </n-tab-pane>
        </n-tabs>

        <div class="grid grid-cols-2 gap-4 border-t pt-4">
          <n-form-item :label="t('ads.placement')">
            <n-select
              v-model:value="form.placement"
              :options="placementOptions"
              size="large"
            />
          </n-form-item>

          <n-form-item :label="t('ads.sortOrder')">
            <n-input-number
              v-model:value="form.sort_order"
              :min="0"
              size="large"
              class="w-full"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('ads.link')">
          <n-input
            v-model:value="form.link"
            :placeholder="t('ads.linkPlaceholder')"
            size="large"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('common.startsAt')">
            <n-date-picker
              v-model:value="form.starts_at"
              type="datetime"
              size="large"
              class="w-full"
              clearable
            />
          </n-form-item>

          <n-form-item :label="t('common.endsAt')">
            <n-date-picker
              v-model:value="form.ends_at"
              type="datetime"
              size="large"
              class="w-full"
              clearable
            />
          </n-form-item>
        </div>

        <div class="flex items-center gap-2 border-t pt-4">
          <span class="text-sm text-slate-500">
            {{ t("common.active") }}
          </span>
          <n-switch v-model:value="form.is_active" />
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">{{
            t("common.cancel")
          }}</n-button>
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingAd ? t("common.edit") : t("common.save") }}
          </n-button>
        </div>
      </template>
    </n-modal>
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="{{ t('common.delete') }}"
      content="{{ t('ads.deleteConfirmation') }}"
      positive-text="{{ t('common.delete') }}"
      negative-text="{{ t('common.cancel') }}"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
    <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Ad Details"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingAd" class="flex flex-col gap-4 py-2">
        <!-- Başlıq -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p
              class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest"
            >
              Reklam
            </p>
            <h3 class="text-2xl font-bold text-indigo-900">
              {{ viewingAd.title || "—" }}
            </h3>
          </div>
          <div class="flex flex-col items-end gap-2">
            <n-tag type="info" size="small" round class="font-mono"
              >#{{ viewingAd.id }}</n-tag
            >
            <n-tag
              :type="viewingAd.is_active ? 'success' : 'default'"
              size="small"
              round
              :bordered="false"
              style="
                font-weight: 800;
                font-size: 10px;
                text-transform: uppercase;
              "
            >
              {{ viewingAd.is_active ? "Aktiv" : "Deaktiv" }}
            </n-tag>
          </div>
        </div>

        <!-- Şəkil -->
        <div
          v-if="viewingAd.image_url"
          class="rounded-2xl overflow-hidden border border-slate-100"
        >
          <img
            :src="viewingAd.image_url"
            :alt="viewingAd.title"
            class="w-full object-cover max-h-48"
          />
        </div>

        <!-- Məzmun -->
        <div
          v-if="viewingAd.body"
          class="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl"
        >
          <p class="text-[10px] uppercase text-indigo-500 font-bold mb-2">
            Məzmun
          </p>
          <p class="text-sm text-indigo-900 leading-relaxed">
            {{ viewingAd.body }}
          </p>
        </div>

        <!-- Link + Button text -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <p class="text-[10px] uppercase text-slate-400 font-bold mb-2">
              Düymə mətni
            </p>
            <span class="font-bold text-slate-700 text-sm">{{
              viewingAd.button_text || "—"
            }}</span>
          </div>
          <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <p class="text-[10px] uppercase text-slate-400 font-bold mb-2">
              Placement
            </p>
            <n-tag
              type="default"
              size="small"
              round
              :bordered="false"
              style="
                font-weight: 800;
                font-size: 10px;
                text-transform: uppercase;
              "
            >
              {{ viewingAd.placement || "—" }}
            </n-tag>
          </div>
        </div>

        <!-- Link -->
        <div
          v-if="viewingAd.link"
          class="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl"
        >
          <p class="text-[10px] uppercase text-blue-500 font-bold mb-2">Link</p>
          <a
            :href="viewingAd.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-800 text-sm font-semibold break-all"
          >
            {{ viewingAd.link }}
          </a>
        </div>

        <!-- Tarixlər -->
        <div
          class="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100"
        >
          <div
            v-if="viewingAd.starts_at"
            class="flex justify-between items-center text-xs"
          >
            <span class="text-slate-400">Başlama:</span>
            <span class="text-slate-700 font-semibold">
              {{ new Date(viewingAd.starts_at).toLocaleDateString("az-AZ") }}
            </span>
          </div>
          <div
            v-if="viewingAd.ends_at"
            class="flex justify-between items-center text-xs"
          >
            <span class="text-slate-400">Bitmə:</span>
            <span class="text-slate-700 font-semibold">
              {{ new Date(viewingAd.ends_at).toLocaleDateString("az-AZ") }}
            </span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-400">Sıra:</span>
            <span class="text-slate-700 font-semibold">{{
              viewingAd.sort_order ?? "—"
            }}</span>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showViewModal = false">Bağla</n-button>
          <n-button
            type="primary"
            @click="() => { showViewModal = false; openEditModal(viewingAd!) }"
          >
            Redaktə et
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive, watch } from "vue";
import {
  NButton,
  NTag,
  useMessage,
  NSpace,
  type DataTableColumns,
} from "naive-ui";
import { Plus, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useAdActions,
  useAds,
  useCreateAd,
  type Ad,
} from "../composables/useContent";
const showDeleteModal = ref(false);
const editingAd = ref<Ad | null>(null);
const deletingId = ref<number | null>(null);
const loadedLangs = ref(new Set<string>());
const isLoadingLang = ref(false);

const { getAd, updateAd, deleteAd } = useAdActions();
const updateLoading = ref(false);
const deleteLoading = ref(false);
const { t } = useI18n();

const message = useMessage();

const filterPlacement = ref<string | null>(null);

const placementOptions = [
  { label: "Home", value: "home" },
  { label: "Doctor List", value: "doctor_list" },
];

const query = computed(() => ({
  ...(filterPlacement.value ? { placement: filterPlacement.value } : {}),
}));

const { ads, isLoading, error, refresh } = useAds(query);
const { createAd, loading: createLoading } = useCreateAd();

watch(
  query,
  () => {
    refresh();
  },
  { immediate: true, deep: true }
);

const showModal = ref(false);
const activeTab = ref("az");
const showViewModal = ref(false);
const viewingAd = ref<Ad | null>(null);

const openViewModal = (row: Ad) => {
  viewingAd.value = row;
  showViewModal.value = true;
};
const form = reactive({
  title: { az: "", en: "", ru: "" },
  body: { az: "", en: "", ru: "" },
  button_text: { az: "", en: "", ru: "" },
  link: "",
  placement: "home",
  starts_at: null as number | null,
  ends_at: null as number | null,
  is_active: true,
  sort_order: 0,
});

const resetForm = () => {
  form.title = { az: "", en: "", ru: "" };
  form.body = { az: "", en: "", ru: "" };
  form.button_text = { az: "", en: "", ru: "" };
  form.link = "";
  form.placement = "home";
  form.starts_at = null;
  form.ends_at = null;
  form.is_active = true;
  form.sort_order = 0;
};

const cleanLangObject = (obj: Record<"az" | "en" | "ru", string>) => {
  const result: Partial<Record<"az" | "en" | "ru", string>> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value.trim()) {
      result[key as "az" | "en" | "ru"] = value.trim();
    }
  });

  return result;
};

const formatDateTime = (ts: number | null) => {
  if (!ts) return null;
  return new Date(ts).toISOString();
};
const fetchLangData = async (id: number, lang: "az" | "en" | "ru") => {
  if (loadedLangs.value.has(lang)) return;

  isLoadingLang.value = true;
  try {
    const response = await getAd(id, lang);
    const ad = response.data;

    form.title[lang] = ad.title ?? "";
    form.body[lang] = ad.body ?? "";
    form.button_text[lang] = ad.button_text ?? "";

    if (!loadedLangs.value.size) {
      form.link = ad.link ?? "";
      form.placement = ad.placement;
      form.starts_at = ad.starts_at ? new Date(ad.starts_at).getTime() : null;
      form.ends_at = ad.ends_at ? new Date(ad.ends_at).getTime() : null;
      form.is_active = ad.is_active;
      form.sort_order = ad.sort_order ?? 0;
    }

    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} {{t('common.langLoadError') }}`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingAd.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingAd.value.id, lang as "az" | "en" | "ru");
  }
};
const openCreateModal = () => {
  editingAd.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Ad) => {
  editingAd.value = row;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;

  await Promise.all([
    fetchLangData(row.id, "az"),
    fetchLangData(row.id, "en"),
    fetchLangData(row.id, "ru"),
  ]);
};

const handleSubmit = async () => {
  if (!form.title.az.trim() || !form.title.en.trim() || !form.title.ru.trim()) {
    message.warning("t('common.titleRequired')");
    return;
  }

  const payload = {
    title: {
      az: form.title.az.trim(),
      en: form.title.en.trim(),
      ru: form.title.ru.trim(),
    },
    body: cleanLangObject(form.body),
    button_text: cleanLangObject(form.button_text),
    link: form.link || null,
    placement: form.placement,
    starts_at: formatDateTime(form.starts_at),
    ends_at: formatDateTime(form.ends_at),
    is_active: form.is_active,
    sort_order: form.sort_order,
  };

  try {
    if (editingAd.value) {
      updateLoading.value = true;
      await updateAd(editingAd.value.id, payload);
      message.success(t("ads.updated"));
    } else {
      await createAd(payload);
      message.success(t("common.created"));
    }

    showModal.value = false;
    await refresh();
  } catch (err: any) {
    message.error(err?.data?.error || t("ads.createError"));
  } finally {
    updateLoading.value = false;
  }
};
const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingId.value) return;

  deleteLoading.value = true;
  try {
    await deleteAd(deletingId.value);
    message.success("Reklam silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error(t("ads.deleteError"));
  } finally {
    deleteLoading.value = false;
  }
};

const columns: DataTableColumns<Ad> = [
  {
    title: t("common.id"),
    key: "id",
    width: 80,
    render: (row) =>
      h(
        "span",
        { class: "text-slate-400 font-mono text-xs font-bold" },
        `#${row.id}`
      ),
  },
  {
    title: t("common.title"),
    key: "title",
    render: (row) =>
      h("div", { class: "flex flex-col" }, [
        h(
          "span",
          { class: "font-bold text-slate-800 text-sm" },
          row.title || "—"
        ),
        h(
          "span",
          { class: "text-xs text-slate-400 line-clamp-1" },
          row.body || "—"
        ),
      ]),
  },
  {
    title: t("ads.image"),
    key: "image_url",
    render: (row) =>
      row.image_url
        ? h("img", {
            src: row.image_url,
            alt: row.title || "Ad image",
            class: "h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200",
          })
        : h("span", { class: "text-slate-400 text-sm" }, "—"),
  },
  {
    title: t("ads.link"),
    key: "link",
    render: (row) =>
      row.link
        ? h(
            "a",
            {
              href: row.link,
              target: "_blank",
              rel: "noopener noreferrer",
              class:
                "text-indigo-600 hover:text-indigo-800 text-sm font-semibold max-w-48 truncate block",
            },
            row.link
          )
        : h("span", { class: "text-slate-400 text-sm" }, "—"),
  },
  {
    title: t("ads.buttonText"),
    key: "button_text",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-700 text-sm font-medium" },
        row.button_text || "—"
      ),
  },
  {
    title: t("common.actions"),
    key: "actions",
    align: "right",
    render: (row) =>
      h(
        NSpace,
        { justify: "end" },
        {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                class:
                  "hover:bg-indigo-50 hover:text-indigo-600 transition-all",
                onClick: () => openEditModal(row),
              },
              { default: () => h(Edit, { size: 16 }) }
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                type: "error",
                class: "hover:bg-rose-50 transition-all",
                onClick: () => openDeleteModal(row.id),
              },
              { default: () => h(Trash2, { size: 16 }) }
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                class: "hover:bg-blue-50 hover:text-blue-600 transition-all",
                onClick: () => openViewModal(row),
              },
              { default: () => h(Eye, { size: 16 }) }
            ),
          ],
        }
      ),
  },
];
</script>

<style>
.modern-table .n-data-table-td {
  vertical-align: middle;
  padding: 12px 16px;
  background-color: transparent !important;
}
.modern-table .n-data-table-tr:hover .n-data-table-td {
  background-color: rgba(79, 70, 229, 0.02) !important;
}
.modern-table .n-data-table-thead .n-data-table-th {
  background-color: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 16px;
  border-bottom: 2px solid #f1f5f9;
}
</style>
