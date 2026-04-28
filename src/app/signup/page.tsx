import { Suspense } from "react";
import SignupPage from "./components/Signup";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}