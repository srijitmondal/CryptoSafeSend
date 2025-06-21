import React from "react";
import { useUser } from "@civic/auth/react";
import { Button } from "@/components/ui/button";

export const CivicLogoutButton: React.FC = () => {
	const { user, signOut, isLoading } = useUser();
	if (!user) return null;
	return (
		<Button
			onClick={signOut}
			className='w-full bg-red-600 hover:bg-red-700 text-white mt-2'>
			{isLoading ? "Signing out..." : "Sign Out of Civic"}
		</Button>
	);
};
