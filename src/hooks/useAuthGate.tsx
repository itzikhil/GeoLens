import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function useAuthGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /** Wraps an action — if not authenticated, shows a toast + redirects to /auth. Returns true if allowed. */
  const requireAuth = (actionLabel = "do this"): boolean => {
    if (user) return true;
    toast({
      title: "Sign in required",
      description: `You need to sign in to ${actionLabel}.`,
      variant: "destructive",
    });
    navigate("/auth");
    return false;
  };

  return { isAuthenticated: !!user, requireAuth };
}
