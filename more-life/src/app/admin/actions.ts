"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAdmin, loginAdmin } from "@/lib/admin";

export async function login(formData: FormData) {
  await loginAdmin(String(formData.get("password") ?? ""));
  revalidatePath("/admin");
}

export async function approveItem(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  await sql`update items set approved = true where id = ${id}`;
  revalidatePath("/admin");
}

export async function rejectItem(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  // Community rejects are deleted outright (votes cascade); curated items are
  // only ever unapproved, never destroyed.
  await sql`delete from items where id = ${id} and pool = 'community'`;
  await sql`update items set approved = false where id = ${id} and pool = 'curated'`;
  revalidatePath("/admin");
}

export async function clearReports(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  await sql`delete from reports where item_id = ${id}`;
  await sql`update items set report_count = 0 where id = ${id}`;
  revalidatePath("/admin");
}
