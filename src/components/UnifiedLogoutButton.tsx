import React from "react";
import { useUser } from "@civic/auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
			variant='outline'
			className='bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 flex items-center font-semibold shadow-sm hover:bg-gray-800 hover:border-blue-500 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'>
			<LogOut className='w-4 h-4 mr-2' />
			{civicLoading ? "Signing out..." : "Logout"}
		</Button>
	);
};
