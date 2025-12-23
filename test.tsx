import { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import {
	CancelButton,
	RenumerateProvider,
	SubscriptionHub,
	useRenumerateContext,
} from "./lib/react";
import React from "react";

function App() {
	const [handshakeToken, setHandshakeToken] = useState("");

	// Create a stable getAuthToken callback
	const getAuthToken = useCallback(
		() => Promise.resolve(handshakeToken),
		[handshakeToken],
	);

	return (
		<div className="container p-4 mx-auto bg-gray-100 rounded-lg flex flex-col gap-8">
			<h1 className="text-3xl font-bold">React Components Test</h1>

			<div className="bg-white p-4 rounded shadow">
				<h2 className="text-xl font-bold mb-4">Handshake Token</h2>
				<p className="text-sm text-gray-600 mb-2">
					Get a handshake token from{" "}
					<code className="bg-gray-100 px-1 rounded">
						GET /api/demo/session?subscription_type=test
					</code>
				</p>
				<input
					type="text"
					value={handshakeToken}
					onChange={(e) => setHandshakeToken(e.target.value)}
					placeholder="Paste handshake token here..."
					className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
				/>
			</div>

			{handshakeToken && (
				<RenumerateProvider
					config={{
						getAuthToken,
						debug: true,
						fallbackEmail: "cancel@renumerate.com",
					}}
				>
					<SessionStatus />

					{/* Retention Section */}
					<div className="bg-white p-4 rounded shadow">
						<h2 className="text-xl font-bold mb-4">Retention (Cancel Button)</h2>
						<div className="flex flex-wrap gap-4">
							<div className="flex flex-col gap-2 items-start">
								<h3 className="font-semibold">Default CancelButton</h3>
								<CancelButton />
							</div>
							<div className="flex flex-col gap-2 items-start">
								<h3 className="font-semibold">Styled CancelButton</h3>
								<CancelButton className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
									Cancel My Subscription
								</CancelButton>
							</div>
						</div>
					</div>

					{/* Subscription Section */}
					<div className="bg-white p-4 rounded shadow">
						<h2 className="text-xl font-bold mb-4">Subscription Hub</h2>
						<SubscriptionHub
							wrapperClassName="h-[400px] w-full"
							iframeClassName="h-[400px] w-full"
							loadingComponent={
								<div className="flex justify-center items-center h-full">
									Loading...
								</div>
							}
						/>
					</div>
				</RenumerateProvider>
			)}
		</div>
	);
}

function SessionStatus() {
	const { session, isSessionLoading, sessionError } = useRenumerateContext();

	return (
		<div className="bg-white p-4 rounded shadow">
			<h2 className="text-xl font-bold mb-2">Session Status</h2>
			{isSessionLoading && <p className="text-yellow-600">Loading session...</p>}
			{sessionError && (
				<p className="text-red-600">Error: {sessionError.message}</p>
			)}
			{session && (
				<div className="text-green-600">
					<p>Session ID: {session.sessionId}</p>
					<p>
						Expires: {new Date(session.expiresAt * 1000).toLocaleString()}
					</p>
				</div>
			)}
		</div>
	);
}

// Mounts the app on index.html
const rootElement = document.getElementById("react-root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(<App />);
}
