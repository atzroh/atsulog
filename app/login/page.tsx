import { loginAction } from "@/app/lib/auth/auth-actions";
import { FormField } from "@/app/components/ui/form-field";
import { Button } from "@/app/components/ui/button";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Login page component.
 * Provides a form for the user to enter their password and authenticate.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-[3rem] px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">
      <div className="max-w-md w-full space-y-[2rem] bg-white p-[2.5rem]">
        <div className="flex flex-col items-center">
          <div className="mb-[1.5rem] relative">
            <div className="relative w-[5rem] h-[5rem] bg-white rounded-3xl shadow-[0_1.25rem_3.125rem_-0.75rem_rgba(0,0,0,0.2)] flex items-center justify-center border border-gray-100">
              <Image
                src="/favicon.ico"
                alt="Site Icon"
                width={48}
                height={48}
                className="w-[3rem] h-[3rem]"
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Admin Login
          </h1>
          <p className="mt-[0.5rem] text-sm text-gray-500 font-medium">
            Welcome back to {siteConfig.title}
          </p>
        </div>

        <form action={loginAction} className="mt-[2rem] space-y-[1.5rem]">
          <div className="space-y-[1rem]">
            <FormField
              id="password"
              type="password"
              defaultValue=""
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-[0.75rem]">
              <p className="text-sm text-red-600 text-center font-medium">
                Invalid password. Please try again.
              </p>
            </div>
          )}

          <div className="pt-[0.5rem]">
            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              className="w-full py-[0.75rem]"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
