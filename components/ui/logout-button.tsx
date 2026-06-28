import { logoutAction } from "@/app/actions/auth";

type LogoutButtonProps = {
  variant?: "light" | "dark";
};

export default function LogoutButton({ variant = "light" }: LogoutButtonProps) {
  const className =
    variant === "dark"
      ? "cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      : "cursor-pointer rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30";

  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        خروج
      </button>
    </form>
  );
}
