"use server";

import { createSession, deleteSession } from "@/app/lib/auth/auth";
import { redirect } from "next/navigation";

/**
 * Server action to handle the login process.
 * Verifies the password against the ADMIN_PASSWORD environment variable.
 * @param formData - The form data containing the 'password' field.
 */
export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  // The ADMIN_PASSWORD must be defined in .env.local or environment variables.
  if (password === process.env.ADMIN_PASSWORD) {
    await createSession();
    redirect("/edit");
  } else {
    // Redirect with an error parameter if authentication fails.
    redirect("/login?error=invalid");
  }
}

/**
 * Server action to handle the logout process.
 * Deletes the session cookie and redirects to the login page.
 */
export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
