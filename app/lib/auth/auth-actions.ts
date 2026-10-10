"use server";

import { createSession, deleteSession } from "@/app/lib/auth/auth";
import { redirect } from "next/navigation";

/** Checks the password against ADMIN_PASSWORD (.env.local or the environment). */
export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  if (password === process.env.ADMIN_PASSWORD) {
    await createSession();
    redirect("/edit");
  }
  redirect("/login?error=invalid");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
