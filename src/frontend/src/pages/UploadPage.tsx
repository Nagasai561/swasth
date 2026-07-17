import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Camera, FileUp, Loader2 } from "lucide-react";
import { getReportAnalysis } from "../lib/api";
import { useLanguage } from "../hooks/useLanguage";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

type UploadState = "empty" | "ready" | "processing" | "complete";

export function UploadPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("empty");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const chooseFile = (nextFile?: File) => {
    if (!nextFile) {
      return;
    }
    setFile(nextFile);
    setState("ready");
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    chooseFile(event.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!file) {
      return;
    }
    setState("processing");
    await getReportAnalysis(language, file);
    setState("complete");
    navigate("/results");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("upload.title")}</h1>
        <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("upload.subtitle")}</p>
      </div>

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
              <p className="text-sm font-semibold text-turmeric">
                {state === "ready" ? t("upload.ready") : state === "processing" ? t("upload.processing") : state === "complete" ? t("upload.complete") : ""}
              </p>
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
    </div>
  );
}
