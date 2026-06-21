import { z } from "zod";

// ── Primitives ───────────────────────────────────────────────────────────────

/** Valid MongoDB ObjectId: 24-character hex string */
export const ObjectIdSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/, "Invalid ID format");

/** Message content: 1–2000 trimmed characters */
export const MessageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty")
  .max(2000, "Message too long (max 2000 characters)");

/** Username: 3–20 alphanumeric + underscore */
export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores");

/** Search query: 2–50 characters, no regex specials */
export const SearchQuerySchema = z
  .string()
  .trim()
  .min(2, "Search query too short")
  .max(50, "Search query too long");

/** Password: at least 6 characters */
export const PasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password too long");

/** Group name: 1–100 trimmed characters */
export const GroupNameSchema = z
  .string()
  .trim()
  .min(1, "Group name is required")
  .max(100, "Group name too long");

/** Group description: 0–500 characters */
export const GroupDescriptionSchema = z
  .string()
  .max(500, "Description too long")
  .default("");

/** Optional URL string */
export const OptionalUrlSchema = z
  .string()
  .url("Invalid URL")
  .nullable()
  .optional();

/** Boolean (coerced from string if needed) */
export const BooleanSchema = z.boolean();

/** Role enum */
export const MemberRoleSchema = z.enum(["admin", "member"]);

// ── Compound Schemas ─────────────────────────────────────────────────────────

export const CreateGroupInputSchema = z.object({
  name: GroupNameSchema,
  memberIds: z.array(ObjectIdSchema).min(0).max(200),
  imageUrl: z.string().nullable().default(null),
  description: GroupDescriptionSchema,
});

export const GetMessagesInputSchema = z.object({
  chatId: ObjectIdSchema,
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional().default(30),
});

export const ChangeMemberRoleInputSchema = z.object({
  chatId: ObjectIdSchema,
  userId: ObjectIdSchema,
  role: MemberRoleSchema,
});

export const AddMembersInputSchema = z.object({
  chatId: ObjectIdSchema,
  userIds: z.array(ObjectIdSchema).min(1).max(200),
});
