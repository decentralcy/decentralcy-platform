import { useRoute } from "wouter";
import WorkerProfileCard from "@/components/WorkerProfileCard";

export default function WorkerProfile() {
  const [match, params] = useRoute("/profile/:walletAddress");
  
  if (!match || !params?.walletAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">No wallet address provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkerProfileCard walletAddress={params.walletAddress} />
    </div>
  );
}