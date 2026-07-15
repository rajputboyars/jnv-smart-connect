import { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Book, type IBook } from "@/models/Book";
import { BookIssue, type IBookIssue } from "@/models/BookIssue";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertStudentInSchool } from "@/lib/auth/student-scope";
import type { BookIssueStatus } from "@/models/enums";
import type {
  CreateBookInput,
  UpdateBookInput,
  BookQueryInput,
  IssueBookInput,
} from "@/validators/library.validator";

const FINE_PER_DAY = 2;

export async function listBooks(query: BookQueryInput, school?: string) {
  await connectDB();

  const filter: QueryFilter<IBook> = {
    ...(school ? { school } : {}),
    ...(query.search
      ? {
          $or: [
            { title: { $regex: query.search, $options: "i" } },
            { author: { $regex: query.search, $options: "i" } },
            { isbn: { $regex: query.search, $options: "i" } },
            { accessionNumber: { $regex: query.search, $options: "i" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Book.find(filter).sort({ title: 1 }).skip(skip).limit(query.limit).lean(),
    Book.countDocuments(filter),
  ]);

  return { items, total };
}

export async function getBookById(id: string, school?: string) {
  await connectDB();
  const book = await Book.findOne({ _id: id, ...(school ? { school } : {}) }).lean();
  if (!book) throw ApiError.notFound("Book not found");
  return book;
}

export async function createBook(input: CreateBookInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await Book.findOne({
    school: actor.school,
    accessionNumber: input.accessionNumber.toUpperCase(),
  });
  if (existing) throw ApiError.conflict("A book with this accession number already exists");

  const book = await Book.create({
    ...input,
    accessionNumber: input.accessionNumber.toUpperCase(),
    availableCopies: input.totalCopies,
    isbn: input.isbn || undefined,
    publisher: input.publisher || undefined,
    coverUrl: input.coverUrl || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "book.create",
    entityType: "Book",
    entityId: book._id,
    school: actor.school,
  });

  return book;
}

export async function updateBook(
  id: string,
  input: UpdateBookInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  const book = await Book.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!book) throw ApiError.notFound("Book not found");

  if (input.totalCopies !== undefined) {
    const delta = input.totalCopies - book.totalCopies;
    book.availableCopies = Math.max(0, book.availableCopies + delta);
    book.totalCopies = input.totalCopies;
  }

  Object.assign(book, {
    title: input.title ?? book.title,
    author: input.author ?? book.author,
    isbn: input.isbn !== undefined ? input.isbn || undefined : book.isbn,
    category: input.category ?? book.category,
    publisher: input.publisher !== undefined ? input.publisher || undefined : book.publisher,
    coverUrl: input.coverUrl !== undefined ? input.coverUrl || undefined : book.coverUrl,
  });

  await book.save();

  await ActivityLog.create({
    user: actor.id,
    action: "book.update",
    entityType: "Book",
    entityId: book._id,
    school: actor.school,
  });

  return book;
}

export async function deleteBook(id: string, actor: { id: string; school?: string }) {
  await connectDB();
  const book = await Book.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!book) throw ApiError.notFound("Book not found");

  const activeIssues = await BookIssue.countDocuments({ book: book._id, status: "issued" });
  if (activeIssues > 0) throw ApiError.conflict("This book has copies currently issued");

  await book.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "book.delete",
    entityType: "Book",
    entityId: book._id,
    school: actor.school,
  });

  return { id: book._id.toString() };
}

export async function listBookIssues(school?: string, status?: BookIssueStatus) {
  await connectDB();
  if (!school) return [];

  const filter: QueryFilter<IBookIssue> = { school, ...(status ? { status } : {}) };
  const issues = await BookIssue.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("book", "title accessionNumber")
    .populate("student", "name admissionNumber")
    .lean();

  const today = new Date();

  return issues.map((issue) => {
    const overdueDays =
      issue.status === "issued" && issue.dueDate < today
        ? Math.ceil((today.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return {
      id: issue._id.toString(),
      book: issue.book,
      student: issue.student,
      issuedDate: issue.issuedDate,
      dueDate: issue.dueDate,
      returnedDate: issue.returnedDate,
      status: issue.status,
      fineAmount: issue.fineAmount,
      finePaid: issue.finePaid,
      overdueDays,
    };
  });
}

export async function issueBook(input: IssueBookInput, actor: { id: string; school?: string }) {
  await connectDB();
  await assertStudentInSchool(input.student, actor.school);

  const book = await Book.findOne({ _id: input.book, school: actor.school });
  if (!book) throw ApiError.badRequest("Book not found");
  if (book.availableCopies < 1) throw ApiError.conflict("No copies of this book are available");

  const existingIssue = await BookIssue.findOne({
    book: input.book,
    student: input.student,
    status: "issued",
  });
  if (existingIssue) throw ApiError.conflict("This student already has this book issued");

  book.availableCopies -= 1;
  await book.save();

  const issue = await BookIssue.create({
    book: input.book,
    student: input.student,
    dueDate: new Date(input.dueDate),
    issuedBy: actor.id,
    status: "issued",
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "book_issue.create",
    entityType: "BookIssue",
    entityId: issue._id,
    school: actor.school,
  });

  return issue;
}

export async function returnBook(id: string, finePaid: boolean, actor: { id: string; school?: string }) {
  await connectDB();

  const issue = await BookIssue.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!issue) throw ApiError.notFound("Issue record not found");
  if (issue.status !== "issued") throw ApiError.conflict("This book has already been returned");

  const now = new Date();
  const overdueDays = issue.dueDate < now
    ? Math.ceil((now.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  issue.returnedDate = now;
  issue.status = "returned";
  issue.fineAmount = overdueDays * FINE_PER_DAY;
  issue.finePaid = finePaid;
  await issue.save();

  await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });

  await ActivityLog.create({
    user: actor.id,
    action: "book_issue.return",
    entityType: "BookIssue",
    entityId: issue._id,
    school: actor.school,
  });

  return issue;
}
