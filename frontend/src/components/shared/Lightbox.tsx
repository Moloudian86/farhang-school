import { useEffect, useRef } from "react";
import { GalleryImage } from "../../types";

/** Full-screen photo viewer built on the browser's own <dialog>: Esc closes it and keyboard focus stays inside. */
export default function Lightbox({ images, index, onClose, onIndex }: {
  images: GalleryImage[]; index: number; onClose: () => void; onIndex: (i: number) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const img = images[index];
  const next = () => onIndex((index + 1) % images.length);
  const prev = () => onIndex((index - 1 + images.length) % images.length);

  useEffect(() => { ref.current?.showModal(); }, []);
  useEffect(() => {
    // Right-to-left site: the left arrow goes forward, the right arrow goes back.
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") next(); if (e.key === "ArrowRight") prev(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nav = "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 font-bold text-primary hover:bg-white";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={img.title}
      className="m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/85 open:flex"
    >
      <figure className="relative max-h-full max-w-4xl text-center text-white">
        <img src={img.imageUrl} alt={img.title} className="mx-auto max-h-[75vh] rounded-xl object-contain" />
        <figcaption className="mt-3">
          <p className="font-bold">{img.title}</p>
          {img.description && <p className="text-sm text-white/75">{img.description}</p>}
        </figcaption>
      </figure>
      <button onClick={onClose} className="absolute end-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary hover:bg-white">بستن</button>
      {images.length > 1 && (
        <>
          <button onClick={next} className={`${nav} end-4`} aria-label="تصویر بعدی">‹</button>
          <button onClick={prev} className={`${nav} start-4`} aria-label="تصویر قبلی">›</button>
        </>
      )}
    </dialog>
  );
}
