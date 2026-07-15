import { z } from "zod";

export const signUploadSchema = z.object({
  folder: z.enum(["students", "teachers"]),
});
export type SignUploadInput = z.infer<typeof signUploadSchema>;
