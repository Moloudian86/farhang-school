import { useEffect } from "react";

/** Sets the browser tab title, e.g. "اخبار | دبستان پسرانه فرهنگ". */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | دبستان پسرانه فرهنگ` : "دبستان پسرانه فرهنگ";
  }, [title]);
}
