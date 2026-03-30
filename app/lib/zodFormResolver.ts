import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, Resolver } from "react-hook-form";

// Bridges current zod/v4 and resolver typing mismatch in one place.
export function createZodFormResolver<T extends FieldValues>(
  schema: unknown,
): Resolver<T> {
  return zodResolver(
    schema as unknown as Parameters<typeof zodResolver>[0],
  ) as unknown as Resolver<T>;
}
