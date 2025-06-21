import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { EnhancedBackground } from "@/components/EnhancedBackground";
import WhyCryptoSafeSend from "./pages/WhyCryptoSafeSend";
import WhyPasscodeProtected from "./pages/WhyPasscodeProtected";
import WhySmartContract from "./pages/WhySmartContract";
import WhyLightningFast from "./pages/WhyLightningFast";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { CivicAuthProvider } from "@civic/auth/react";
import { useAnyAuth } from "@/hooks/useAnyAuth";

const queryClient = new QueryClient();

const AppContent = () => {
	const { isAuthenticated, loading } = useAnyAuth();

	if (loading) {
		return (
			<EnhancedBackground>
				<div className='min-h-screen flex items-center justify-center'>
					<div className='text-center'>
						<div className='w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4'></div>
						<div className='text-white text-xl font-medium'>
							Loading CryptoSafeSend...
						</div>
						<div className='text-gray-400 text-sm mt-2'>
							Preparing your secure experience
						</div>
					</div>
				</div>
			</EnhancedBackground>
		);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={isAuthenticated ? <Index /> : <AuthForm />} />
				<Route
					path='/dashboard'
					element={isAuthenticated ? <Dashboard /> : <AuthForm />}
				/>
				<Route
					path='/why-passcode-protected'
					element={<WhyPasscodeProtected />}
				/>
				<Route path='/why-smart-contract' element={<WhySmartContract />} />
				<Route path='/why-lightning-fast' element={<WhyLightningFast />} />
				<Route path='/why-cryptosafesend' element={<WhyCryptoSafeSend />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<CivicAuthProvider clientId='7dedabaf-362a-407c-9119-268a3f09361e'>
				<AuthProvider>
					<WalletProvider>
						<AppContent />
					</WalletProvider>
				</AuthProvider>
			</CivicAuthProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
