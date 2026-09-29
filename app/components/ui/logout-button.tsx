import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/lib/auth/auth-actions";

/**
 * A reusable logout button component.
 * Uses a server action to handle the logout process.
 * @returns The logout button element.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center bg-transparent border-none p-0 cursor-pointer"
      >
        <LogOut className="size-[1.125rem] md:size-[1rem] md:mr-[0.375rem]" />
        <span className="hidden md:inline">Logout</span>
      </button>
    </form>
  );
}
