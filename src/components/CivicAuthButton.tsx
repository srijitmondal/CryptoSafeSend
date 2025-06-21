import React from "react";
import { useUser } from "@civic/auth/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CivicAuthButton: React.FC = () => {
  const { user, signIn, signOut, isLoading, authStatus } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authStatus === "authenticated") {
      // Use replace to avoid back navigation to login
      navigate("/", { replace: true });
    }
  }, [authStatus, navigate]);

  return (
    <div className="flex flex-col items-center gap-2 my-2 w-full">
      {user ? (
        <Button
          onClick={signOut}
          className="w-full flex items-center gap-2 bg-[#181C27] border border-[#23283A] text-white hover:bg-[#23283A] hover:border-[#3B82F6] rounded-xl px-5 py-2 shadow transition-all duration-300 hover:scale-105"
        >
          {/* Optional: Add an icon here if you want to match the wallet button */}
          {isLoading ? "Signing out..." : "Sign Out of Civic"}
        </Button>
      ) : (
        <>
          <div className="w-full flex items-center gap-2 my-4">
            <div className="flex-grow border-t border-gray-700" />
            <span className="text-gray-400 text-xs font-semibold px-2 select-none">
              or sign in with Civic
            </span>
            <div className="flex-grow border-t border-gray-700" />
          </div>
          <Button
            onClick={() => signIn()}
            className="w-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isLoading ? "Signing in..." : "Sign In with Civic"}
          </Button>
        </>
      )}
    </div>
  );
};
