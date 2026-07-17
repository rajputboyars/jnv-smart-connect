export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const HOUSES = ["Aravalli", "Nilgiri", "Shivalik", "Vindhyachal"] as const;
export type House = (typeof HOUSES)[number];

export const STUDENT_STATUSES = [
  "active",
  "inactive",
  "alumni",
  "transferred",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STAFF_STATUSES = ["active", "inactive", "on_leave", "resigned"] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "urgent",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_AUDIENCE_SCOPES = [
  "all",
  "roles",
  "class",
  "section",
  "users",
] as const;
export type NotificationAudienceScope = (typeof NOTIFICATION_AUDIENCE_SCOPES)[number];

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "half_day",
  "leave",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_ENTITY_TYPES = ["student", "teacher"] as const;
export type AttendanceEntityType = (typeof ATTENDANCE_ENTITY_TYPES)[number];

export const ATTENDANCE_METHODS = ["manual", "qr"] as const;
export type AttendanceMethod = (typeof ATTENDANCE_METHODS)[number];

export const HOSTEL_NIGHT_STATUSES = ["present", "absent", "on_leave"] as const;
export type HostelNightStatus = (typeof HOSTEL_NIGHT_STATUSES)[number];

export const HOSTEL_ALLOCATION_STATUSES = ["active", "vacated"] as const;
export type HostelAllocationStatus = (typeof HOSTEL_ALLOCATION_STATUSES)[number];

export const LEAVE_REQUEST_STATUSES = ["pending", "approved", "rejected", "cancelled"] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export const GATE_PASS_STATUSES = ["issued", "returned", "overdue"] as const;
export type GatePassStatus = (typeof GATE_PASS_STATUSES)[number];

export const MEDICINE_ROUTES = ["oral", "topical", "injection", "other"] as const;
export type MedicineRoute = (typeof MEDICINE_ROUTES)[number];

export const BOOK_ISSUE_STATUSES = ["issued", "returned", "lost"] as const;
export type BookIssueStatus = (typeof BOOK_ISSUE_STATUSES)[number];

// --- Finance ---

export const FEE_FREQUENCIES = ["one_time", "monthly", "quarterly", "annual"] as const;
export type FeeFrequency = (typeof FEE_FREQUENCIES)[number];

export const FEE_INVOICE_STATUSES = ["pending", "partial", "paid", "overdue", "cancelled"] as const;
export type FeeInvoiceStatus = (typeof FEE_INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "card", "online", "cheque", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SCHOLARSHIP_TYPES = ["percentage", "fixed"] as const;
export type ScholarshipType = (typeof SCHOLARSHIP_TYPES)[number];

export const REFUND_STATUSES = ["pending", "approved", "rejected", "processed"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

// --- Inventory ---

export const ASSET_CATEGORY_TYPES = [
  "furniture",
  "sports",
  "computer_lab",
  "science_lab",
  "library",
  "hostel",
  "classroom",
  "other",
] as const;
export type AssetCategoryType = (typeof ASSET_CATEGORY_TYPES)[number];

export const ASSET_CONDITIONS = ["new", "good", "fair", "poor", "damaged"] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export const ASSET_STATUSES = ["in_use", "in_store", "under_repair", "disposed"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const STOCK_UNITS = ["piece", "box", "packet", "ream", "litre", "kg", "set"] as const;
export type StockUnit = (typeof STOCK_UNITS)[number];

export const STOCK_TRANSACTION_TYPES = ["purchase", "issue", "adjustment"] as const;
export type StockTransactionType = (typeof STOCK_TRANSACTION_TYPES)[number];

export const INVENTORY_REQUEST_STATUSES = ["pending", "approved", "rejected", "fulfilled"] as const;
export type InventoryRequestStatus = (typeof INVENTORY_REQUEST_STATUSES)[number];

export const PURCHASE_ORDER_STATUSES = ["draft", "sent", "received", "cancelled"] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

// --- HR ---

export const STAFF_LEAVE_TYPES = ["casual", "sick", "earned", "unpaid", "other"] as const;
export type StaffLeaveType = (typeof STAFF_LEAVE_TYPES)[number];

export const EMPLOYEE_DOCUMENT_TYPES = [
  "resume",
  "id_proof",
  "certificate",
  "contract",
  "other",
] as const;
export type EmployeeDocumentType = (typeof EMPLOYEE_DOCUMENT_TYPES)[number];

export const PAYSLIP_STATUSES = ["draft", "generated", "paid"] as const;
export type PayslipStatus = (typeof PAYSLIP_STATUSES)[number];

// --- Maintenance ---

export const MAINTENANCE_CATEGORIES = [
  "electrical",
  "furniture",
  "cleaning",
  "water",
  "internet",
  "building_repair",
  "other",
] as const;
export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

export const MAINTENANCE_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const MAINTENANCE_STATUSES = ["open", "assigned", "in_progress", "resolved", "closed"] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

// --- Events ---

export const EVENT_TYPES = [
  "sports",
  "annual_day",
  "ncc",
  "scouts",
  "competition",
  "exhibition",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_PARTICIPANT_ROLES = ["participant", "winner", "runner_up", "organizer"] as const;
export type EventParticipantRole = (typeof EVENT_PARTICIPANT_ROLES)[number];
