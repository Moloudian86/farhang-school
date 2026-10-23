import { createContext, useContext } from "react";
import { StudentOverview } from "../../panelTypes";

/** The student's data, shared by every student/parent page below the scope component. */
export const OverviewContext = createContext<StudentOverview | null>(null);

export function useOverview(): StudentOverview {
  const data = useContext(OverviewContext);
  if (!data) throw new Error("useOverview must be used inside a student or parent scope");
  return data;
}
