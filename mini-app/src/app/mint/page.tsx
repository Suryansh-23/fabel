import { Suspense } from "react";
import { LoadingScreen } from "~/components/ui/Loading";
import MintPageContent from "./MintPageContent";

export default function MintPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading mint page..." />}>
      <MintPageContent />
    </Suspense>
  );
}
