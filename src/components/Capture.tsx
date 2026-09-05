import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, ImageUp, RefreshCw } from "lucide-react";

interface CaptureProps { onCapture: (imageDataUrl: string) => void; }
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    image.src = url;
  });
}

export default function Capture({ onCapture }: CaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = React.useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((track) => track.stop()); }, [stream]);

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) { setError("Камера недоступна в этом браузере. Загрузите фотографию вручную."); return; }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      setStream(mediaStream);
      setCapturedImage(null);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; });
    } catch (cameraError) {
      console.error("Ошибка доступа к камере:", cameraError);
      setError("Камера недоступна. Проверьте разрешение браузера или загрузите фото вручную.");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) { setError("Камера ещё загружается — попробуйте через секунду."); return; }
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 900; canvas.height = 900;
    canvas.getContext("2d")?.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, 900, 900);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.88));
    stopCamera();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) { setError("Выберите файл изображения: JPG, PNG, WEBP или HEIC."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("Файл слишком большой. Максимальный размер — 10 МБ."); return; }
    try { setCapturedImage(await resizeImage(file)); stopCamera(); }
    catch { setError("Не удалось прочитать изображение. Попробуйте другой файл."); }
  };

  const resetImage = () => { setCapturedImage(null); setError(null); };
  const isCameraActive = Boolean(stream) && !capturedImage;

  return (
    <section className="mx-auto flex min-h-[80vh] w-full max-w-xl flex-col items-center justify-center bg-[#fdfdfb] px-4 py-8 text-[#111111] sm:px-6">
      <div className="mb-7 text-center"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Шаг 1 из 4</p><h2 className="text-2xl font-light uppercase tracking-[0.14em] text-zinc-800">Снимок ладони</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">Ладонь вверх, пальцы расслаблены, вся ладонь в кадре. Избегайте бликов и сильных теней.</p></div>
      <div className="relative h-72 w-72 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm sm:h-80 sm:w-80">
        {isCameraActive ? <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" /> : capturedImage ? <img src={capturedImage} alt="Предпросмотр снимка ладони" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center p-6 text-center text-zinc-400"><Camera size={30} strokeWidth={1.2} /><p className="mt-3 text-xs">Камера не запущена</p></div>}
        {isCameraActive && <div className="pointer-events-none absolute inset-8 rounded-[40%] border border-dashed border-white/70"><span className="absolute left-0 right-0 top-1/2 text-center text-[10px] uppercase tracking-widest text-white/80">Центр ладони</span></div>}
      </div>
      {error && <p role="alert" className="mt-4 max-w-sm text-center text-xs leading-relaxed text-red-600">{error}</p>}
      <div className="mt-7 flex w-full max-w-md flex-col gap-3">
        {capturedImage ? <div className="flex gap-3"><button type="button" onClick={resetImage} className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"><RefreshCw size={16} className="mr-2 inline" />Заново</button><button type="button" onClick={() => onCapture(capturedImage)} className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"><ArrowRight size={16} className="mr-2 inline" />Далее</button></div> : <><button type="button" onClick={isCameraActive ? takePhoto : startCamera} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">{isCameraActive ? <><Camera size={18} /> Сделать снимок</> : <><Camera size={18} /> Включить камеру</>}</button><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-zinc-900"><ImageUp size={18} /> Загрузить фото<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" onChange={handleFileUpload} /></label></>}
      </div>
      <p className="mt-5 max-w-sm text-center text-[10px] leading-relaxed text-zinc-400">Фото не отправляется на сервер и удаляется из памяти при перезагрузке страницы. Максимальный размер файла — 10 МБ.</p>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
