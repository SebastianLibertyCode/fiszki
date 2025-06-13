import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface HeaderProps {
  user: {
    email: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/decks" className="text-xl font-semibold">
          Fiszki
        </a>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
