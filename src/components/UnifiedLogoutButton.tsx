import React from "react";
import { useUser } from "@civic/auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const UnifiedLogoutButton: React.FC = () => {
	const {
		user: civicUser,
		signOut: civicSignOut,
		isLoading: civicLoading,
	} = useUser();
	const { currentUser: firebaseUser, logout: firebaseLogout } = useAuth();

	const handleLogout = async () => {
		if (firebaseUser) await firebaseLogout();
		if (civicUser) await civicSignOut();
		window.location.reload(); // Ensure UI updates after logout
	};

	if (!firebaseUser && !civicUser) return null;

	return (
		<Button
			onClick={handleLogout}
			className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow'>
			{civicLoading ? "Signing out..." : "Sign Out"}
		</Button>
	);
};
