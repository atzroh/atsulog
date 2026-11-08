import { loginAction } from "@/app/lib/auth/auth-actions";
import { FormField } from "@/app/components/ui/form-field";
import { Button } from "@/app/components/ui/button";
import { PageHeading } from "@/app/components/ui/page-heading";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/app/lib/site-config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10">
        <div className="flex flex-col items-center">
          <div className="mb-6 relative w-20 h-20 bg-white rounded-2xl shadow-[0_1.25rem_3.125rem_-0.75rem_rgba(0,0,0,0.2)] flex items-center justify-center border border-gray-100">
            <Image
              src="/favicon.ico"
              alt="Site Icon"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          <PageHeading>Admin Login</PageHeading>
          <p className="mt-2 text-sm text-muted font-medium">
            Welcome back to {siteConfig.title}
          </p>
        </div>

        <form action={loginAction} className="mt-8 space-y-6">
          <FormField
            id="password"
            type="password"
            defaultValue=""
            placeholder="Enter admin password"
          />

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center font-medium">
                {error === "locked"
                  ? "Too many failed attempts. Please try again later."
                  : "Invalid password. Please try again."}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              className="w-full py-3"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
