import { Link } from "react-router-dom";
import { formatDate, formatTime } from "../../lib/format";
import { EventItem, NewsItem } from "../../types";

function Cover({ src, alt }: { src: string | null; alt: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
  ) : (
    <div className="aspect-[16/10] w-full bg-primary/10" aria-hidden="true" />
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/10 transition hover:shadow-md">
      <Cover src={item.imageUrl} alt={item.title} />
      <div className="p-5">
        <p className="text-xs text-primary">
          {item.category.name} - {formatDate(item.publishedAt)}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-8">
          <Link to={`/news/${item.slug}`} className="hover:text-primary">{item.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-ink/70">{item.summary}</p>
      </div>
    </article>
  );
}

export function EventCard({ item }: { item: EventItem }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/10">
      <Cover src={item.imageUrl} alt={item.title} />
      <div className="p-5">
        <p className="inline-block rounded-lg bg-accent px-3 py-1 text-sm font-bold text-ink">
          {formatDate(item.eventDate)}
        </p>
        <h3 className="mt-3 text-lg font-bold leading-8">{item.title}</h3>
        <p className="mt-1 text-sm text-ink/70">
          ساعت {formatTime(item.startTime)} - {item.location}
        </p>
      </div>
    </article>
  );
}
