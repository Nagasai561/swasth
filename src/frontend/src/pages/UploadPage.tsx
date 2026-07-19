import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Camera, Eye, FileImage, FileText, FileUp, Loader2, Sparkles, X } from "lucide-react";
import { describeError, uploadReportFile } from "../lib/api";
import { loadSelectedSampleProfile, resolveSampleAssetUrl, sampleReportToFile } from "../lib/sampleProfiles";
import type { SampleProfile } from "../lib/sampleProfiles";
import { useLanguage } from "../hooks/useLanguage";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

type UploadState = "empty" | "ready" | "processing" | "complete";
type PreviewModalState = { title: string; url: string; mimeType: string } | null;

const scanningMessageKeys = ["upload.scan.scanning", "upload.scan.extracting", "upload.scan.checking", "upload.scan.reviewing", "upload.scan.preparing"];

export function UploadPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("empty");
  const [error, setError] = useState("");
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [sampleProfile, setSampleProfile] = useState<SampleProfile | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [previewModal, setPreviewModal] = useState<PreviewModalState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state !== "processing") {
      setScanMessageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setScanMessageIndex((current) => (current + 1) % scanningMessageKeys.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    const loadSample = async () => {
      try {
        const sample = await loadSelectedSampleProfile();
        if (isMounted) {
          setSampleProfile(sample);
        }
      } catch (sampleError) {
        if (isMounted) {
          setError(describeError(sampleError));
        }
      }
    };

    void loadSample();

    return () => {
      isMounted = false;
    };
  }, []);

  const chooseFile = (nextFile?: File) => {
    if (!nextFile) {
      return;
    }
    setFile(nextFile);
    setState("ready");
    setError("");
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    chooseFile(event.dataTransfer.files[0]);
  };

  const uploadFile = async (nextFile?: File) => {
    if (!nextFile) {
      return;
    }
    setState("processing");
    setError("");
    try {
      await uploadReportFile(nextFile, language);
      setState("complete");
      navigate("/results");
    } catch (uploadError) {
      setState("ready");
      setError(describeError(uploadError));
    }
  };

  const analyze = async () => {
    await uploadFile(file ?? undefined);
  };

  const chooseSampleReport = async () => {
    if (!sampleProfile || state === "processing" || isLoadingSample) {
      return;
    }

    try {
      setIsLoadingSample(true);
      setError("");
      const sampleFile = await sampleReportToFile(sampleProfile.report);
      chooseFile(sampleFile);
    } catch (sampleError) {
      setState(file ? "ready" : "empty");
      setError(describeError(sampleError));
    } finally {
      setIsLoadingSample(false);
    }
  };

  const previewSelectedFile = () => {
    if (!file || !previewUrl) {
      return;
    }

    setPreviewModal({ title: file.name, url: previewUrl, mimeType: file.type });
  };

  const previewSampleReport = () => {
    if (!sampleProfile) {
      return;
    }

    setPreviewModal({
      title: sampleProfile.report.fileName,
      url: resolveSampleAssetUrl(sampleProfile.report.assetPath),
      mimeType: sampleProfile.report.mimeType
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("upload.title")}</h1>
        <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("upload.subtitle")}</p>
      </div>

      {sampleProfile ? (
        <div className="flex w-full flex-col gap-3 rounded-soft border border-turmeric/35 bg-turmeric/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-soft bg-white text-pine">
              {isLoadingSample ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-5" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold uppercase text-turmeric">Test sample ready</span>
              <span className="mt-1 block text-base font-semibold text-charcoal">{sampleProfile.label}: {sampleProfile.report.fileName}</span>
              <span className="mt-1 block text-sm leading-6 text-warmgray">Preview it first or load it into the uploader, then analyze when ready.</span>
            </span>
          </span>
          <span className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={previewSampleReport} disabled={state === "processing"}>
              <Eye className="size-4" aria-hidden="true" />
              Preview
            </Button>
            <Button type="button" onClick={() => void chooseSampleReport()} disabled={state === "processing" || isLoadingSample}>
              {isLoadingSample ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <FileUp className="size-4" aria-hidden="true" />}
              Use sample
            </Button>
          </span>
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-5">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="grid min-h-80 place-items-center rounded-soft border-2 border-dashed border-line bg-paper px-5 py-10 text-center"
          >
            <div className="max-w-md space-y-5">
              <span className="mx-auto grid size-16 place-items-center rounded-soft bg-pine/10 text-pine">
                {state === "processing" ? <Loader2 className="size-8 animate-spin" aria-hidden="true" /> : <FileUp className="size-8" aria-hidden="true" />}
              </span>
              <div>
                <h2 className="font-serif text-3xl font-semibold text-charcoal">{file ? t("upload.selected") : t("upload.dropTitle")}</h2>
                <p className="mt-2 text-warmgray">{file ? file.name : t("upload.dropSubtitle")}</p>
              </div>
              {file ? <ReportPreview file={file} isProcessing={state === "processing"} previewUrl={previewUrl} message={t(scanningMessageKeys[scanMessageIndex])} onPreview={previewSelectedFile} /> : null}
              <p className="text-sm font-semibold text-turmeric">
                {state === "ready" ? t("upload.ready") : state === "processing" ? t("upload.processing") : state === "complete" ? t("upload.complete") : ""}
              </p>
              {error ? <p className="rounded-soft border border-brick/30 bg-brick/5 px-3 py-2 text-sm font-semibold text-brick">{error}</p> : null}
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="size-4" aria-hidden="true" />
                  {t("upload.choose")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="size-4" aria-hidden="true" />
                  {t("upload.camera")}
                </Button>
              </div>
              <Button type="button" disabled={!file || state === "processing"} onClick={analyze} className="w-full sm:w-auto">
                {t("upload.analyze")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={onInputChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onInputChange} />
      {previewModal ? <ReportPreviewModal preview={previewModal} onClose={() => setPreviewModal(null)} /> : null}
    </div>
  );
}

function ReportPreview({ file, isProcessing, previewUrl, message, onPreview }: { file: File; isProcessing: boolean; previewUrl: string; message: string; onPreview: () => void }) {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="mx-auto w-full max-w-sm text-left">
      <div className="relative overflow-hidden rounded-soft border border-line bg-white shadow-soft">
        <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2 text-xs font-semibold text-warmgray">
          {isImage ? <FileImage className="size-4 text-pine" aria-hidden="true" /> : <FileText className="size-4 text-pine" aria-hidden="true" />}
          <span className="truncate">{file.name}</span>
          <button type="button" onClick={onPreview} disabled={isProcessing} className="ml-auto inline-flex items-center gap-1 rounded-soft px-2 py-1 text-pine transition hover:bg-pine/10 disabled:cursor-not-allowed disabled:opacity-50">
            <Eye className="size-3.5" aria-hidden="true" />
            Preview
          </button>
        </div>
        <div className="relative h-64 overflow-hidden bg-[#fbfaf7]">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover opacity-80" />
          ) : (
            <div className="mx-auto my-5 h-52 w-40 rounded-sm border border-line bg-white p-4 shadow-soft">
              <div className="mb-4 h-5 w-24 rounded bg-pine/15" />
              <div className="space-y-2">
                <div className="h-2 rounded bg-line" />
                <div className="h-2 rounded bg-line" />
                <div className="h-2 w-4/5 rounded bg-line" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-2 rounded bg-turmeric/20" />
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-2 rounded bg-line" />
                <div className="h-2 w-2/3 rounded bg-line" />
              </div>
            </div>
          )}

          {isProcessing ? (
            <div className="pointer-events-none absolute inset-0 bg-pine/5">
              <div className="absolute inset-x-0 top-0 h-16 animate-[scan_1.8s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-turmeric/15 to-transparent">
                <div className="mx-3 h-1 rounded-full bg-turmeric shadow-[0_0_22px_rgba(217,142,43,0.95),0_0_42px_rgba(217,142,43,0.5)]" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {isProcessing ? (
        <p className="mt-3 rounded-soft border border-turmeric/25 bg-turmeric/10 px-3 py-2 text-center text-sm font-semibold text-pine" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function ReportPreviewModal({ preview, onClose }: { preview: NonNullable<PreviewModalState>; onClose: () => void }) {
  const isImage = preview.mimeType.startsWith("image/");
  const isPdf = preview.mimeType === "application/pdf" || preview.title.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" role="dialog" aria-modal="true" aria-label="Report preview">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-soft border border-line bg-white shadow-soft">
        <div className="flex min-h-14 items-center gap-3 border-b border-line bg-paper px-4">
          <FileText className="size-5 shrink-0 text-pine" aria-hidden="true" />
          <h2 className="min-w-0 flex-1 truncate font-semibold text-charcoal">{preview.title}</h2>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-soft text-pine transition hover:bg-pine/10">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close preview</span>
          </button>
        </div>
        <div className="h-[72vh] bg-[#fbfaf7] p-3">
          {isImage ? (
            <img src={preview.url} alt="" className="mx-auto h-full max-w-full object-contain" />
          ) : isPdf ? (
            <object data={preview.url} type="application/pdf" className="h-full w-full rounded-soft border border-line bg-white">
              <iframe title={preview.title} src={preview.url} className="h-full w-full rounded-soft border-0" />
            </object>
          ) : (
            <div className="grid h-full place-items-center text-center text-warmgray">Preview is not available for this file type.</div>
          )}
        </div>
      </div>
    </div>
  );
}
