import { useState } from "react";
import ReactDOM from "react-dom/client";
import { CancelButton, RenumerateProvider, SubscriptionHub } from "./react";

function App() {
	const [retentionSessionId, setRetentionSessionId] = useState("");
	const [subscriptionSessionId, setSubscriptionSessionId] = useState("");

	return (
		<div className="container p-4 mx-auto bg-gray-100 rounded-lg flex flex-col gap-8">
			<h1 className="text-3xl font-bold">React Components Test</h1>

			{/* Retention Section */}
			<div className="bg-white p-4 rounded shadow">
				<h2 className="text-xl font-bold mb-4">Retention</h2>
				<div className="w-full mb-4">
					<input
						type="text"
						value={retentionSessionId}
						onChange={(e) => setRetentionSessionId(e.target.value)}
						placeholder="RetentionSessionID"
						className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>

				{retentionSessionId && (
					<div className="flex flex-wrap gap-4 mt-4">
						<div className="flex flex-col gap-2 items-start">
							<h3 className="font-semibold">Default CancelButton</h3>
							<RenumerateProvider config={{ publicKey: "test", debug: true }}>
								<CancelButton sessionId={retentionSessionId} />
							</RenumerateProvider>
						</div>
					</div>
				)}
			</div>

			{/* Subscription Section */}
			<div className="bg-white p-4 rounded shadow">
				<h2 className="text-xl font-bold mb-4">Subscriptions</h2>
				<div className="w-full mb-4">
					<input
						type="text"
						value={subscriptionSessionId}
						onChange={(e) => setSubscriptionSessionId(e.target.value)}
						placeholder="SubscriptionSessionID"
						className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
					/>
				</div>

				{subscriptionSessionId && (
					<div className="mt-4">
						<h3 className="font-semibold mb-2">SubscriptionHub</h3>
						<div>
							<RenumerateProvider config={{ publicKey: "test", debug: true }}>
								<SubscriptionHub wrapperClassName="h-[320px] w-full" iframeClassName="h-[320px] w-full" sessionId={subscriptionSessionId} />
							</RenumerateProvider>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Mounts the app on index.html
const rootElement = document.getElementById("react-root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(<App />);
}
