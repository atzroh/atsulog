import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/lib/auth/auth-actions";

/** A logout button that submits the logout server action. */
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
