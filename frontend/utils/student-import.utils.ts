import * as XLSX from "xlsx";
import type { AxiosError } from "@/interface/axios.interface";
import type {
  ApiErrorResponse,
  ApiResponse,
} from "@/interface/api.interface";
import type {
  StudentImportDto,
  StudentImportValidationResult,
} from "@/interface/admin/admin.interface";

const REQUIRED_HEADERS = ["Email", "FirstName", "LastName"] as const;
const VALID_EXTENSIONS = [".xlsx", ".xls"] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type StudentImportHeader = (typeof REQUIRED_HEADERS)[number];

interface StudentImportProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class StudentImportError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = "StudentImportError";
    this.details = details;
  }
}

export function isValidStudentImportFile(file: File): boolean {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  return VALID_EXTENSIONS.includes(extension as (typeof VALID_EXTENSIONS)[number]);
}

export function formatFileSize(bytes: number): string {
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

export function downloadStudentImportTemplate(): void {
  const sampleData = [
    {
      Email: "student1@example.com",
      FirstName: "Alex",
      LastName: "Johnson",
    },
    {
      Email: "student2@example.com",
      FirstName: "Maria",
      LastName: "Nguyen",
    },
    {
      Email: "student3@example.com",
      FirstName: "Daniel",
      LastName: "Tran",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student_import_template.xlsx");
}

export async function parseStudentImportFile(
  file: File,
  onProgress?: (value: number) => void,
): Promise<StudentImportValidationResult> {
  if (!isValidStudentImportFile(file)) {
    throw new StudentImportError(
      "Only Excel files (.xlsx, .xls) are accepted.",
    );
  }

  onProgress?.(10);
  const arrayBuffer = await readFileAsArrayBuffer(file, (value) => {
    onProgress?.(Math.min(50, Math.max(10, Math.round(value * 0.5))));
  });

  onProgress?.(60);
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new StudentImportError(
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
    throw new StudentImportError("The Excel file is empty.");
  }

  onProgress?.(70);
  const headerRow = (rows[0] ?? []).map((cell) => String(cell).trim());
  const headerIssues = getHeaderIssues(headerRow);

  if (headerIssues.length > 0) {
    return {
      students: [],
      issues: headerIssues,
      totalRows: Math.max(rows.length - 1, 0),
      validRows: 0,
    };
  }

  const headerIndexes = getHeaderIndexes(headerRow);
  const issues: string[] = [];
  const students: StudentImportDto[] = [];
  const emailSet = new Set<string>();

  rows.slice(1).forEach((row, index) => {
    const actualRowNumber = index + 2;
    const email = getCellValue(row, headerIndexes.Email);
    const firstName = getCellValue(row, headerIndexes.FirstName);
    const lastName = getCellValue(row, headerIndexes.LastName);

    if (!email && !firstName && !lastName) {
      return;
    }

    const rowIssues: string[] = [];

    if (!email) {
      rowIssues.push("Email is required");
    } else if (!EMAIL_REGEX.test(email)) {
      rowIssues.push("Email format is invalid");
    }

    if (!firstName) {
      rowIssues.push("First name is required");
    }

    if (!lastName) {
      rowIssues.push("Last name is required");
    }

    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail && emailSet.has(normalizedEmail)) {
      rowIssues.push("Duplicate email found in the file");
    }

    if (rowIssues.length > 0) {
      issues.push(`Row ${actualRowNumber}: ${rowIssues.join(", ")}`);
      return;
    }

    emailSet.add(normalizedEmail);
    students.push({ email, firstName, lastName });
  });

  onProgress?.(80);

  if (students.length === 0 && issues.length === 0) {
    issues.push("The worksheet does not contain any student rows.");
  }

  return {
    students,
    issues,
    totalRows: Math.max(rows.length - 1, 0),
    validRows: students.length,
  };
}

export function validateManualStudents(
  students: StudentImportDto[],
): StudentImportValidationResult {
  const issues: string[] = [];
  const sanitizedStudents: StudentImportDto[] = [];
  const emailSet = new Set<string>();

  students.forEach((student, index) => {
    const rowNumber = index + 1;
    const email = student.email.trim();
    const firstName = student.firstName.trim();
    const lastName = student.lastName.trim();

    if (!email && !firstName && !lastName) {
      return;
    }

    const rowIssues: string[] = [];

    if (!email) {
      rowIssues.push("Email is required");
    } else if (!EMAIL_REGEX.test(email)) {
      rowIssues.push("Email format is invalid");
    }

    if (!firstName) {
      rowIssues.push("First name is required");
    }

    if (!lastName) {
      rowIssues.push("Last name is required");
    }

    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail && emailSet.has(normalizedEmail)) {
      rowIssues.push("Duplicate email found in the form");
    }

    if (rowIssues.length > 0) {
      issues.push(`Entry ${rowNumber}: ${rowIssues.join(", ")}`);
      return;
    }

    emailSet.add(normalizedEmail);
    sanitizedStudents.push({ email, firstName, lastName });
  });

  if (sanitizedStudents.length === 0 && issues.length === 0) {
    issues.push("Please enter at least one student.");
  }

  return {
    students: sanitizedStudents,
    issues,
    totalRows: students.length,
    validRows: sanitizedStudents.length,
  };
}

export function createStudentImportError(error: unknown): StudentImportError {
  if (error instanceof StudentImportError) {
    return error;
  }

  const axiosError = error as AxiosError & {
    response?: {
      status: number;
      data?: AxiosError["response"]["data"] &
        Partial<StudentImportProblemDetails> &
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
    "Failed to import students.";

  const details = flattenErrorMap(responseData?.errors);
  const parsedMessageDetails = parseFailureDetails(message);
  const parsedDetails =
    details.length > 0 ? details : parsedMessageDetails.details;
  const normalizedMessage = parsedMessageDetails.summary || message;

  return new StudentImportError(normalizedMessage, parsedDetails);
}

function getHeaderIssues(headerRow: string[]): string[] {
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerRow.includes(header),
  );

  if (missingHeaders.length === 0) {
    return [];
  }

  return [
    `Missing required column${missingHeaders.length > 1 ? "s" : ""}: ${missingHeaders.join(", ")}`,
    `Expected headers: ${REQUIRED_HEADERS.join(", ")}`,
  ];
}

function getHeaderIndexes(
  headerRow: string[],
): Record<StudentImportHeader, number> {
  return {
    Email: headerRow.indexOf("Email"),
    FirstName: headerRow.indexOf("FirstName"),
    LastName: headerRow.indexOf("LastName"),
  };
}

function getCellValue(row: unknown[], cellIndex: number): string {
  const cell = row[cellIndex];
  return String(cell ?? "").trim();
}

function flattenErrorMap(errors?: Record<string, string[]>): string[] {
  if (!errors) {
    return [];
  }

  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => (field ? `${field}: ${message}` : message)),
  );
}

function parseFailureDetails(message: string): {
  summary: string;
  details: string[];
} {
  if (!message.includes("Failures:")) {
    return { summary: message, details: [] };
  }

  const [summary, rawDetails] = message.split("Failures:");
  const details = rawDetails
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    summary: summary.trim(),
    details,
  };
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
        new StudentImportError(
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
