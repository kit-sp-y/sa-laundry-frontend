import type { Metadata } from "next";
import LoginForm from "@/app/login/LoginForm";

export const metadata: Metadata = {
	title: "Sign in",
};

export default function LoginPage() {
	return (
		<div className="min-h-screen w-full bg-gray-100">
			<main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4">
				<LoginForm />
			</main>
		</div>
	);
}

