import { useUser } from "@civic/auth/react";
import { useAuth } from "@/contexts/AuthContext";

export function useAnyAuth() {
	const { currentUser, loading: firebaseLoading } = useAuth();
	const { user: civicUser, isLoading: civicLoading } = useUser();
	return {
		isAuthenticated: !!currentUser || !!civicUser,
		loading: firebaseLoading || civicLoading,
		firebaseUser: currentUser,
		civicUser,
	};
}
