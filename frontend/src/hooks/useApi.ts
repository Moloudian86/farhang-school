import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api, apiPost } from "../lib/api";
import { Category, EventItem, Facility, GalleryImage, NewsDetail, NewsItem, SchoolInfo, Statistic, Teacher } from "../types";

const data = <T,>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const useSchoolInfo = () => useQuery({ queryKey: ["school-info"], queryFn: () => data(api<SchoolInfo>("/school-info")) });
export const useStatistics = () => useQuery({ queryKey: ["statistics"], queryFn: () => data(api<Statistic[]>("/statistics")) });
export const useFacilities = () => useQuery({ queryKey: ["facilities"], queryFn: () => data(api<Facility[]>("/facilities")) });
export const useTeachers = () => useQuery({ queryKey: ["teachers"], queryFn: () => data(api<Teacher[]>("/teachers")) });

export const useLatestNews = (limit = 3) =>
  useQuery({ queryKey: ["news", "latest", limit], queryFn: () => data(api<NewsItem[]>(`/news?limit=${limit}`)) });

export const useUpcomingEvents = (limit = 3) =>
  useQuery({ queryKey: ["events", "upcoming", limit], queryFn: () => data(api<EventItem[]>(`/events?upcoming=true&limit=${limit}`)) });

/** Builds "?a=1&b=2" and skips empty values. */
const qs = (params: Record<string, string | number | undefined>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && u.set(k, String(v)));
  return `?${u.toString()}`;
};

// These lists keep the old page visible while the next page loads (no flicker).
export const useNewsList = (p: { page: number; category: string; search: string }) =>
  useQuery({
    queryKey: ["news", "list", p],
    queryFn: () => api<NewsItem[]>(`/news${qs({ limit: 9, page: p.page, category: p.category, search: p.search })}`),
    placeholderData: keepPreviousData,
  });
export const useNewsCategories = () => useQuery({ queryKey: ["news", "categories"], queryFn: () => data(api<Category[]>("/news/categories")) });
export const useNewsDetail = (slug: string) =>
  useQuery({ queryKey: ["news", "detail", slug], queryFn: () => data(api<NewsDetail>(`/news/${encodeURIComponent(slug)}`)), retry: false });

export const useEventsList = (p: { page: number; upcoming: boolean }) =>
  useQuery({
    queryKey: ["events", "list", p],
    queryFn: () => api<EventItem[]>(`/events${qs({ limit: 9, page: p.page, upcoming: p.upcoming ? "true" : undefined })}`),
    placeholderData: keepPreviousData,
  });

export const useGallery = (category: string) =>
  useQuery({ queryKey: ["gallery", category], queryFn: () => data(api<GalleryImage[]>(`/gallery${qs({ limit: 50, category })}`)) });
export const useGalleryCategories = () => useQuery({ queryKey: ["gallery", "categories"], queryFn: () => data(api<Category[]>("/gallery/categories")) });

// ---- Public forms (POST) ----
export interface ContactPayload { name: string; email: string; phone?: string; subject: string; message: string; website?: string }
export interface EnrollmentPayload {
  firstName: string; lastName: string; nationalCode: string; birthDate: string; gradeLevel: number; fatherName: string;
  parentPhone: string; address: string; previousEducation?: string; notes?: string; website?: string;
}

export const useSendContact = () => useMutation({ mutationFn: (body: ContactPayload) => apiPost<{ id: number }>("/contact", body) });
export const useSendEnrollment = () => useMutation({ mutationFn: (body: EnrollmentPayload) => apiPost<{ id: number }>("/enrollments", body) });
