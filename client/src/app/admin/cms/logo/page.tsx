"use client";

import { useEffect, useState } from "react";
import {
  defaultLogoContent,
  fetchAdminCmsSection,
  resolveCmsAssetUrl,
  updateAdminCmsSection,
  uploadAdminCmsImage,
  type LogoCmsContent,
} from "@/services/cmsService";

export default function AdminCmsLogoPage() {
  const [content, setContent] = useState<LogoCmsContent>(defaultLogoContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAdminCmsSection<LogoCmsContent>("logo")
      .then((response) => setContent(response.content))
      .catch(() => {
        setMessage("Using default logo because CMS data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setMessage("");
      const response = await uploadAdminCmsImage(file);
      setContent((current) => ({ ...current, logoUrl: response.url }));
      setMessage("Logo uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      await updateAdminCmsSection("logo", content);
      setMessage("Logo updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save logo content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0aa6c9]">
          CMS
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f2344]">Logo Section</h1>
        <p className="mt-2 text-[#4d5f7c]">
          Upload and manage the main website logo used in the navbar and footer.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#d8e7f1] bg-white p-6 shadow-[0_16px_40px_rgba(15,35,68,0.06)]">
        {loading ? (
          <p className="text-[#4d5f7c]">Loading logo content...</p>
        ) : (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#4d5f7c]">Alt Text</span>
              <input
                value={content.altText}
                onChange={(event) =>
                  setContent((current) => ({ ...current, altText: event.target.value }))
                }
                className="w-full rounded-[20px] border border-[#d8e7f1] bg-[#fbfdff] px-4 py-3 text-[#0f2344] outline-none transition focus:border-[#0aa6c9] focus:ring-2 focus:ring-[#0aa6c9]/15"
              />
            </label>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#4d5f7c]">Logo Preview</p>
                {content.logoUrl ? (
                  <button
                    type="button"
                    onClick={() => setContent((current) => ({ ...current, logoUrl: "" }))}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700"
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>

              {content.logoUrl ? (
                <div className="overflow-hidden rounded-[20px] border border-[#d8e7f1] bg-[#f8fbff] p-4">
                  <img
                    src={resolveCmsAssetUrl(content.logoUrl)}
                    alt={content.altText}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#b9d6e4] bg-[#f8fbff] px-4 py-8 text-sm text-[#5d708f]">
                  No logo uploaded yet.
                </div>
              )}

              <label className="flex w-full cursor-pointer items-center justify-center rounded-full border border-[#d8e7f1] bg-white px-4 py-3 text-sm font-semibold text-[#0f2344] transition hover:border-[#0aa6c9]/35 hover:text-[#0088c5]">
                {uploading ? "Uploading..." : "Choose Logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            {message ? (
              <div className="rounded-[20px] border border-[#d8e7f1] bg-[linear-gradient(135deg,#eff8ff_0%,#f8fbff_100%)] px-4 py-3 text-sm text-[#0f2344]">
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#0aa6c9_0%,#0088c5_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(10,166,201,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Logo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
