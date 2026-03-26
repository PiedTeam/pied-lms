import * as XLSX from "xlsx";
import type { AxiosError } from "@/interface/axios.interface";
import type {
  ApiErrorResponse,
  ApiResponse,
} from "@/interface/api.interface";
import type {
  ExamImportValidationResult,
  ImportedExamTestCase,
} from "@/interface/exam/exam.interface";

const VALID_EXTENSIONS = [".xlsx", ".xls"] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ROW_COUNT = 200;

type HeaderKey =
  | "examTitle"
  | "description"
  | "totalMarks"
  | "passingMarks"
  | "index"
  | "input"
  | "output"
  | "isHidden";

const HEADER_ALIASES: Record<HeaderKey, string[]> = {
  examTitle: ["exam title", "title", "examtitle"],
  description: ["description", "exam description", "examdescription"],
  totalMarks: ["points", "total marks", "totalmarks", "exam points"],
  passingMarks: ["passing marks", "passing score", "pass marks", "passingmarks"],
  index: ["test case index", "index", "testcase index", "testcaseindex"],
  input: ["test case input", "input", "testcase input", "testcaseinput"],
  output: ["expected output", "output", "expectedoutput"],
  isHidden: ["hidden", "is hidden", "ishidden"],
};

const REQUIRED_HEADERS: HeaderKey[] = [
  "examTitle",
  "totalMarks",
  "input",
  "output",
];

interface ParsedExamMetadata {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

interface PendingTestCase {
  index?: number;
  input: string;
  output: string;
  isHidden: boolean;
  sourceRow: number;
}

interface ExamImportProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class ExamImportError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = "ExamImportError";
    this.details = details;
  }
}

export function isValidExamImportFile(file: File): boolean {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  return VALID_EXTENSIONS.includes(
    extension as (typeof VALID_EXTENSIONS)[number],
  );
}

export function formatImportFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function downloadExamImportTemplate(): void {
  const sampleData = [
    {
      "Exam Title": "Midterm C Programming",
      Description: "Loop and array practice exam",
      Points: 100,
      "Passing Marks": 50,
      "Test Case Index": 1,
      "Test Case Input": "5\n1 2 3 4 5",
      "Expected Output": "15",
      Hidden: "FALSE",
    },
    {
      "Exam Title": "",
      Description: "",
      Points: "",
      "Passing Marks": "",
      "Test Case Index": 2,
      "Test Case Input": "3\n10 20 30",
      "Expected Output": "60",
      Hidden: "TRUE",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 30 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 28 },
    { wch: 28 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ExamImport");
  XLSX.writeFile(workbook, "exam_import_template.xlsx");
}

export async function parseExamImportFile(
  file: File,
  onProgress?: (value: number) => void,
): Promise<ExamImportValidationResult> {
  if (!isValidExamImportFile(file)) {
    throw new ExamImportError("Only Excel files (.xlsx, .xls) are accepted.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ExamImportError("The selected file exceeds the 5 MB size limit.");
  }

  onProgress?.(10);
  const arrayBuffer = await readFileAsArrayBuffer(file, (value) => {
    onProgress?.(Math.min(50, Math.max(10, Math.round(value * 0.5))));
  });

  onProgress?.(60);
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new ExamImportError(
      "The selected file does not contain any worksheet.",
    );
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  if (rows.length === 0) {
    throw new ExamImportError("The Excel file is empty.");
  }

  const totalRows = Math.max(rows.length - 1, 0);
  if (totalRows > MAX_ROW_COUNT) {
    throw new ExamImportError(
      `The file contains ${totalRows} rows. The maximum allowed is ${MAX_ROW_COUNT}.`,
    );
  }

  onProgress?.(70);

  const headerRow = (rows[0] ?? []).map((cell) => normalizeHeaderCell(cell));
  const headerIndexes = getHeaderIndexes(headerRow);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (key) => headerIndexes[key] === -1,
  );

  if (missingHeaders.length > 0) {
    return {
      title: "",
      description: "",
      totalMarks: 0,
      passingMarks: 0,
      testCases: [],
      issues: [
        `Missing required column${missingHeaders.length > 1 ? "s" : ""}: ${missingHeaders
          .map(getDisplayHeaderName)
          .join(", ")}`,
      ],
      totalRows,
      validRows: 0,
    };
  }

  const issues: string[] = [];
  const pendingTestCases: PendingTestCase[] = [];
  let metadata: ParsedExamMetadata | null = null;

  rows.slice(1).forEach((row, rowIndex) => {
    const sourceRow = rowIndex + 2;
    const normalizedRow = row as unknown[];
    const rowIssues: string[] = [];

    const examTitle = getCellValue(normalizedRow, headerIndexes.examTitle);
    const description = getCellValue(normalizedRow, headerIndexes.description);
    const totalMarksRaw = getCellValue(normalizedRow, headerIndexes.totalMarks);
    const passingMarksRaw = getCellValue(
      normalizedRow,
      headerIndexes.passingMarks,
    );
    const input = normalizeMultilineCell(
      getCellValue(normalizedRow, headerIndexes.input),
    );
    const output = normalizeMultilineCell(
      getCellValue(normalizedRow, headerIndexes.output),
    );
    const indexRaw = getCellValue(normalizedRow, headerIndexes.index);
    const isHiddenRaw = getCellValue(normalizedRow, headerIndexes.isHidden);

    if (
      !examTitle &&
      !description &&
      !totalMarksRaw &&
      !passingMarksRaw &&
      !indexRaw &&
      !input &&
      !output &&
      !isHiddenRaw
    ) {
      return;
    }

    if (!metadata) {
      if (!examTitle) {
        rowIssues.push(`Row ${sourceRow}: Missing Exam Title.`);
      }

      const totalMarks = parsePositiveInteger(totalMarksRaw);
      if (totalMarks === null) {
        rowIssues.push(`Row ${sourceRow}: Points must be a positive integer.`);
      }

      if (rowIssues.length > 0) {
        issues.push(...rowIssues);
        return;
      }

      const resolvedTotalMarks = parsePositiveInteger(totalMarksRaw)!;
      const parsedPassingMarks = parseOptionalInteger(passingMarksRaw);
      const resolvedPassingMarks =
        parsedPassingMarks ?? Math.max(1, Math.ceil(resolvedTotalMarks / 2));

      if (
        resolvedPassingMarks <= 0 ||
        resolvedPassingMarks > resolvedTotalMarks
      ) {
        rowIssues.push(
          `Row ${sourceRow}: Passing Marks must be greater than 0 and less than or equal to Points.`,
        );
        issues.push(...rowIssues);
        return;
      }

      metadata = {
        title: examTitle,
        description,
        totalMarks: resolvedTotalMarks,
        passingMarks: resolvedPassingMarks,
      };
    } else {
      if (examTitle && examTitle !== metadata.title) {
        rowIssues.push(
          `Row ${sourceRow}: Exam Title must match the first non-empty row.`,
        );
      }

      const rowPoints = parseOptionalInteger(totalMarksRaw);
      if (rowPoints !== null && rowPoints !== metadata.totalMarks) {
        rowIssues.push(`Row ${sourceRow}: Points must match the exam value.`);
      }

      const rowPassingMarks = parseOptionalInteger(passingMarksRaw);
      if (
        rowPassingMarks !== null &&
        rowPassingMarks !== metadata.passingMarks
      ) {
        rowIssues.push(
          `Row ${sourceRow}: Passing Marks must match the exam value.`,
        );
      }
    }

    if (!input) {
      rowIssues.push(`Row ${sourceRow}: Missing Test Case Input.`);
    }

    if (!output) {
      rowIssues.push(`Row ${sourceRow}: Missing Expected Output.`);
    }

    const parsedIndex = parseOptionalInteger(indexRaw);
    if (indexRaw && parsedIndex === null) {
      rowIssues.push(
        `Row ${sourceRow}: Test Case Index must be a positive integer.`,
      );
    }

    const parsedHidden = parseBooleanValue(isHiddenRaw);
    if (isHiddenRaw && parsedHidden === null) {
      rowIssues.push(
        `Row ${sourceRow}: Hidden must be TRUE/FALSE, YES/NO, or 1/0.`,
      );
    }

    if (rowIssues.length > 0) {
      issues.push(...rowIssues);
    }

    if (!input || !output) {
      return;
    }

    pendingTestCases.push({
      index: parsedIndex ?? undefined,
      input,
      output,
      isHidden: parsedHidden ?? false,
      sourceRow,
    });
  });

  if (!metadata && issues.length === 0) {
    issues.push("The worksheet does not contain any exam rows.");
  }

  const finalizedTestCases = assignTestCaseIndexes(pendingTestCases, issues);

  onProgress?.(85);

  return {
    title: metadata?.title ?? "",
    description: metadata?.description ?? "",
    totalMarks: metadata?.totalMarks ?? 0,
    passingMarks: metadata?.passingMarks ?? 0,
    testCases: finalizedTestCases,
    issues,
    totalRows,
    validRows: finalizedTestCases.length,
  };
}

export function createExamImportError(error: unknown): ExamImportError {
  if (error instanceof ExamImportError) {
    return error;
  }

  const axiosError = error as AxiosError & {
    response?: {
      status: number;
      data?: AxiosError["response"]["data"] &
        Partial<ExamImportProblemDetails> &
        Partial<ApiErrorResponse> &
        Partial<ApiResponse<string>>;
    };
  };

  const responseData = axiosError.response?.data;
  const message =
    responseData?.message?.trim() ||
    responseData?.detail?.trim() ||
    responseData?.error?.trim() ||
    (error instanceof Error ? error.message.trim() : "") ||
    "Failed to import exam.";

  return new ExamImportError(message, flattenErrorMap(responseData?.errors));
}

function assignTestCaseIndexes(
  testCases: PendingTestCase[],
  issues: string[],
): ImportedExamTestCase[] {
  const usedIndexes = new Set<number>();

  testCases.forEach((testCase) => {
    if (typeof testCase.index === "number") {
      if (usedIndexes.has(testCase.index)) {
        issues.push(
          `Row ${testCase.sourceRow}: Duplicate Test Case Index ${testCase.index}.`,
        );
        return;
      }
      usedIndexes.add(testCase.index);
    }
  });

  let nextIndex = 1;

  return testCases.map((testCase) => {
    let resolvedIndex = testCase.index;

    if (typeof resolvedIndex !== "number") {
      while (usedIndexes.has(nextIndex)) {
        nextIndex += 1;
      }
      resolvedIndex = nextIndex;
      usedIndexes.add(resolvedIndex);
    }

    return {
      index: resolvedIndex,
      input: testCase.input,
      output: testCase.output,
      isHidden: testCase.isHidden,
      sourceRow: testCase.sourceRow,
    };
  });
}

function parsePositiveInteger(value: string): number | null {
  const parsed = parseOptionalInteger(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function parseOptionalInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseBooleanValue(value: string): boolean | null {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "yes", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "0"].includes(normalized)) {
    return false;
  }

  return null;
}

function getHeaderIndexes(headerRow: string[]): Record<HeaderKey, number> {
  return (Object.keys(HEADER_ALIASES) as HeaderKey[]).reduce(
    (accumulator, key) => {
      accumulator[key] = headerRow.findIndex((header) =>
        HEADER_ALIASES[key].includes(header),
      );
      return accumulator;
    },
    {} as Record<HeaderKey, number>,
  );
}

function normalizeHeaderCell(cell: unknown): string {
  return String(cell ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getCellValue(row: unknown[], index: number): string {
  if (index < 0) {
    return "";
  }

  return String(row[index] ?? "").trim();
}

function normalizeMultilineCell(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function getDisplayHeaderName(key: HeaderKey): string {
  switch (key) {
    case "examTitle":
      return "Exam Title";
    case "totalMarks":
      return "Points";
    case "input":
      return "Test Case Input";
    case "output":
      return "Expected Output";
    default:
      return key;
  }
}

function flattenErrorMap(errors?: Record<string, string[]>): string[] {
  if (!errors) {
    return [];
  }

  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => (field ? `${field}: ${message}` : message)),
  );
}

function readFileAsArrayBuffer(
  file: File,
  onProgress?: (value: number) => void,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.((event.loaded / event.total) * 100);
      }
    };

    reader.onerror = () => {
      reject(
        new ExamImportError(
          "Unable to read the selected file. Please try again.",
        ),
      );
    };

    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.readAsArrayBuffer(file);
  });
}
