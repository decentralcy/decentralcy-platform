import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Wallet, 
  Briefcase, 
  MessageCircle, 
  Scale, 
  Search,
  Users,
  Globe,
  Shield
} from "lucide-react";

// Enhanced Loading Spinner with context
export function LoadingSpinner({ message = "Loading...", size = "default" }: { 
  message?: string; 
  size?: "sm" | "default" | "lg" 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Job Card Skeleton
export function JobCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// Worker Profile Skeleton
export function WorkerProfileSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Message List Skeleton
export function MessageListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Search Loading with animated elements
export function SearchLoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Search className="w-8 h-8 text-primary animate-pulse" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Blockchain Transaction Loading
export function TransactionLoadingState({ 
  type = "transaction",
  hash,
  confirmations = 0
}: { 
  type?: "transaction" | "deployment" | "interaction";
  hash?: string;
  confirmations?: number;
}) {
  const getIcon = () => {
    switch (type) {
      case "deployment":
        return <Shield className="w-6 h-6 text-blue-500" />;
      case "interaction":
        return <Briefcase className="w-6 h-6 text-green-500" />;
      default:
        return <Wallet className="w-6 h-6 text-purple-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "deployment":
        return "Deploying Smart Contract";
      case "interaction":
        return "Processing Contract Interaction";
      default:
        return "Processing Transaction";
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {getIcon()}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">{getTitle()}</h3>
            {hash && (
              <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                {hash.slice(0, 20)}...
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {confirmations}/12 confirmations
              </Badge>
              <div className="w-24 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(confirmations / 12) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// IPFS Upload Progress
export function IPFSUploadProgress({ 
  stage = "preparing",
  progress = 0,
  message = "Preparing upload..."
}: {
  stage?: "preparing" | "uploading" | "verifying" | "complete";
  progress?: number;
  message?: string;
}) {
  const getStageIcon = () => {
    switch (stage) {
      case "uploading":
        return <Globe className="w-5 h-5 text-blue-500 animate-spin" />;
      case "verifying":
        return <Shield className="w-5 h-5 text-orange-500 animate-pulse" />;
      case "complete":
        return <Globe className="w-5 h-5 text-green-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-500 animate-bounce" />;
    }
  };

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {getStageIcon()}
          <span className="font-medium text-green-800 dark:text-green-200">
            {message}
          </span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-green-700 dark:text-green-300 mt-2">
          Stage: {stage.toUpperCase()} • {progress}% complete
        </div>
      </CardContent>
    </Card>
  );
}

// Dispute Resolution Loading
export function DisputeLoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 animate-pulse" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Messaging Loading State
export function MessagingLoadingState() {
  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      <div className="w-1/3 border-r bg-muted/20 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 animate-pulse" />
          <Skeleton className="h-5 w-24" />
        </div>
        <MessageListSkeleton />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground animate-bounce" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Loading State
export function DashboardLoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generic Empty State
export function EmptyState({ 
  icon: Icon = Users,
  title = "No data found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction
}: {
  icon?: any;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 space-y-4">
      <Icon className="w-12 h-12 mx-auto text-muted-foreground" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}