import { Prisma } from "@prisma/client";
import { formatStudentCode, isValidEntryGrade, isValidEntryYear } from "./identifiers";

/** What a new Student row needs for its permanent code (spread it into `prisma.student.create({ data })`). */
export interface AllocatedStudentCode {
  studentCode: string;
  entryYear: number;
  entryGrade: number;
  entrySequence: number;
}

/**
 * Finds the next free student code for (entry year + entry grade):
 * if the last one is 1405-1-007 the next one is 1405-1-008.
 *
 * - The BACKEND calls this; the client can never send its own code.
 * - Call it inside the same transaction that creates the student and pass the transaction client as `db`.
 * - Two admins approving at the same moment may compute the same number. The database then rejects the
 *   second one (unique index on student_code / entry_year+entry_grade+entry_sequence, Prisma error P2002),
 *   so duplicates are impossible. The caller should simply retry once or twice on P2002.
 */
export async function allocateStudentCode(
  db: Prisma.TransactionClient,
  entryYear: number,
  entryGrade: number
): Promise<AllocatedStudentCode> {
  if (!isValidEntryYear(entryYear)) throw new Error(`Invalid entry year: ${entryYear}`);
  if (!isValidEntryGrade(entryGrade)) throw new Error(`Invalid entry grade: ${entryGrade}`);

  const last = await db.student.aggregate({ where: { entryYear, entryGrade }, _max: { entrySequence: true } });
  const entrySequence = (last._max.entrySequence ?? 0) + 1;
  return { studentCode: formatStudentCode(entryYear, entryGrade, entrySequence), entryYear, entryGrade, entrySequence };
}
