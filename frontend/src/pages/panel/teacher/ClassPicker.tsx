import { TeacherClass } from "../../../panelTypes";

/** Dropdown of the teacher's classes. Used by attendance, grades and homework pages. */
export default function ClassPicker({ classes, value, onChange, id = "class-picker" }: { classes: TeacherClass[]; value: number | null; onChange: (id: number) => void; id?: string }) {
  return (
    <select id={id} value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))} className="rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-primary/20">
      {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>)}
    </select>
  );
}
