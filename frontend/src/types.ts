// Shapes of the data the API sends (see docs/API.md).
export interface PageMeta { page: number; limit: number; total: number; totalPages: number }
export interface SchoolInfo {
  name: string; slogan: string; shortIntro: string; about: string; philosophy: string; address: string;
  phone: string; email: string; workingHours: string; latitude: number | null; longitude: number | null; heroImageUrl: string | null; aboutImageUrl: string | null;
}
export interface Statistic { id: number; label: string; value: number; suffix: string | null }
export interface Category { id: number; name: string; slug: string }
export interface NewsItem {
  id: number; title: string; slug: string; summary: string; imageUrl: string | null;
  author: string; publishedAt: string; category: Category;
}
export interface NewsDetail extends NewsItem { content: string }
export interface EventItem {
  id: number; title: string; description: string; imageUrl: string | null;
  eventDate: string; startTime: string; location: string; category: Category;
}
export interface Facility { id: number; title: string; description: string; icon: string | null; imageUrl: string | null }
export interface Teacher {
  id: number; firstName: string; lastName: string; position: string; subject: string; degree: string;
  experienceYears: number; bio: string | null; imageUrl: string | null;
}
export interface GalleryImage {
  id: number; title: string; description: string | null; imageUrl: string; takenAt: string | null; category: Category;
}
