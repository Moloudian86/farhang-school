import { Dumbbell, FlaskConical, Laptop, Library, LucideIcon, Monitor, MoonStar, Presentation, School, Trees } from "lucide-react";
import { Facility, Teacher } from "../../types";

// The database stores icon NAMES; we map them to real icons here. Unknown name -> a school icon.
const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor, "flask-conical": FlaskConical, library: Library, dumbbell: Dumbbell,
  "moon-star": MoonStar, laptop: Laptop, presentation: Presentation, trees: Trees,
};

export function FacilityCard({ item }: { item: Facility }) {
  const Icon = (item.icon && ICONS[item.icon]) || School;
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/10">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-primary/10 text-primary" aria-hidden="true">
          <Icon className="h-14 w-14" strokeWidth={1.5} />
        </div>
      )}
      <div className="p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true" />{item.title}</h3>
        <p className="mt-2 text-sm leading-7 text-ink/70">{item.description}</p>
      </div>
    </article>
  );
}

export function TeacherCard({ item }: { item: Teacher }) {
  const initials = `${item.firstName[0] ?? ""}‌${item.lastName[0] ?? ""}`;
  const name = `${item.firstName} ${item.lastName}`;
  return (
    <article className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-primary/10">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={name} loading="lazy" className="mx-auto h-28 w-28 rounded-full object-cover" />
      ) : (
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-white" aria-hidden="true">
          {initials}
        </div>
      )}
      <h3 className="mt-4 text-lg font-bold">{name}</h3>
      <p className="text-sm font-medium text-primary">{item.position}</p>
      <p className="mt-2 text-sm text-ink/70">{item.subject} - {item.degree}</p>
      {item.bio && <p className="mt-3 line-clamp-3 text-sm leading-7 text-ink/60">{item.bio}</p>}
    </article>
  );
}
