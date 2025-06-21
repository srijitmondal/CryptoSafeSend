import React from "react";
import { useUser } from "@civic/auth/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CivicAuthButton: React.FC = () => {
	const { user, signIn, signOut, isLoading, authStatus } = useUser();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (authStatus === "authenticated") {
			navigate("/"); // Redirect to index page after login
		}
	}, [authStatus, navigate]);

	return (
		<div className='flex flex-col items-center gap-2 my-2'>
			{user ? (
				<Button
					onClick={signOut}
					className='w-full bg-red-600 hover:bg-red-700 text-white'>
					{isLoading ? "Signing out..." : "Sign Out of Civic"}
				</Button>
			) : (
				<Button
					onClick={() => signIn()}
					className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
					{isLoading ? "Signing in..." : "Sign In with Civic"}
				</Button>
			)}
		</div>
	);
};
