import { Suspense } from "react";
import PinLogin from "@/components/PinLogin";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="safe-px flex min-h-dvh items-center justify-center text-sm text-foreground/50">
          Loading…
        </div>
      }
    >
      <PinLogin />
    </Suspense>
  );
}
