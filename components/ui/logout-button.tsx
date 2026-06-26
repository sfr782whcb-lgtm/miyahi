import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="cursor-pointer rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
      >
        خروج
      </button>
    </form>
  );
}
