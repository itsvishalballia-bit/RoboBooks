"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Video } from "lucide-react";
import { resolveCmsAssetUrl } from "@/services/cmsService";

const JoditEditor = dynamic(
  () => import("jodit-react").then((module) => module.default),
  { ssr: false }
);

type UploadedMedia = {
  url: string;
  kind: "image" | "video";
  mimeType: string;
};

function normalizeRichText(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  const html = hasHtmlTag
    ? trimmed
    : trimmed
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
        .join("");

  return html.replace(
    /\b(src|poster)=["']([^"']+)["']/gi,
    (_match, attribute: string, url: string) =>
      `${attribute}="${resolveCmsAssetUrl(url)}"`
  );
}

function normalizeEditorOutput(value: string) {
  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed === "<p><br></p>" ||
    trimmed === "<br>" ||
    trimmed === "<p></p>"
  ) {
    return "";
  }

  return trimmed;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export default function CmsJoditEditor({
  label,
  value,
  onChange,
  minHeight = 180,
  onUploadMedia,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  onUploadMedia: (file: File) => Promise<UploadedMedia>;
}) {
  const editorRef = useRef<any>(null);
  const imageInputId = useId();
  const videoInputId = useId();
  const [editorValue, setEditorValue] = useState(() => normalizeRichText(value));
  const [uploadingType, setUploadingType] = useState<"image" | "video" | null>(null);

  useEffect(() => {
    const normalized = normalizeRichText(value);
    if (normalized !== editorValue) {
      setEditorValue(normalized);
    }
  }, [value, editorValue]);

  const config = useMemo(
    () => ({
      readonly: false,
      minHeight,
      toolbarAdaptive: false,
      statusbar: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      beautifyHTML: false,
      enter: "P",
      defaultMode: 1,
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "fontsize",
        "paragraph",
        "|",
        "link",
        "blockquote",
        "table",
        "hr",
        "|",
        "undo",
        "redo",
        "|",
        "source",
      ],
      removeButtons: ["image", "video", "file"],
    }),
    [minHeight]
  );

  const pushChange = (nextValue: string) => {
    const normalized = normalizeEditorOutput(nextValue);
    setEditorValue(normalized);
    onChange(normalized);
  };

  const readCurrentEditorHtml = () => {
    const editor = editorRef.current?.editor ?? editorRef.current;
    if (!editor) {
      return editorValue;
    }

    return editor.value ?? editor.getEditorValue?.() ?? editor.editor?.innerHTML ?? editorValue;
  };

  const insertMedia = async (file: File, expectedType: "image" | "video") => {
    try {
      setUploadingType(expectedType);
      const media = await onUploadMedia(file);
      const editor = editorRef.current?.editor ?? editorRef.current;
      const resolvedUrl = resolveCmsAssetUrl(media.url);

      const html =
        media.kind === "video"
          ? `<video controls playsinline preload="metadata"><source src="${resolvedUrl}" type="${media.mimeType}"></video><p><br></p>`
          : `<p><img src="${resolvedUrl}" alt="${escapeHtmlAttribute(file.name)}" /></p><p><br></p>`;

      editor?.selection?.insertHTML?.(html);

      if (typeof window !== "undefined") {
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
      }

      pushChange(readCurrentEditorHtml());
    } catch (error) {
      console.error("Failed to upload editor media", error);
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <div className="block">
      {label ? (
        <span className="mb-2 block text-sm font-medium text-[#4d5f7c]">{label}</span>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-[#d8e7f1] bg-[#fbfdff]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#d8e7f1] bg-white px-3 py-3">
          <label
            htmlFor={imageInputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8e7f1] bg-[#fbfdff] px-3 py-1.5 text-sm font-semibold text-[#0f2344] transition hover:border-[#0aa6c9]/35 hover:text-[#0088c5]"
          >
            {uploadingType === "image" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            Insert image
          </label>
          <input
            id={imageInputId}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingType !== null}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await insertMedia(file, "image");
              }
              event.currentTarget.value = "";
            }}
          />

          <label
            htmlFor={videoInputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8e7f1] bg-[#fbfdff] px-3 py-1.5 text-sm font-semibold text-[#0f2344] transition hover:border-[#0aa6c9]/35 hover:text-[#0088c5]"
          >
            {uploadingType === "video" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Video size={16} />
            )}
            Insert video
          </label>
          <input
            id={videoInputId}
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploadingType !== null}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await insertMedia(file, "video");
              }
              event.currentTarget.value = "";
            }}
          />

          <span className="ml-auto text-xs text-[#6b7d99]">
            Images and videos are uploaded to CMS storage and inserted with live preview.
          </span>
        </div>

        <div className="[&_img]:max-w-full [&_img]:rounded-[20px] [&_video]:max-w-full [&_video]:rounded-[20px]">
          <JoditEditor
            ref={editorRef}
            value={editorValue}
            config={config}
            onBlur={pushChange}
            onChange={pushChange}
          />
        </div>
      </div>
    </div>
  );
}
