/**
 * SDK Session management for unified authentication.
 *
 * Handles auth token exchange and session storage.
 * Session IDs are prefixed with 'r10_' and stored in sessionStorage.
 */

const SESSION_STORAGE_KEY = "renumerate_sdk_session";
// Buffer time before expiry to trigger refresh (1 minute in ms)
const SESSION_EXPIRY_BUFFER_MS = 60 * 1000;

export interface SdkSession {
	sessionId: string;
	expiresAt: number; // Unix timestamp in seconds
}

export class SessionManager {
	private session: SdkSession | null = null;
	private getAuthToken: () => Promise<string>;
	private debug: boolean;
	private refreshPromise: Promise<SdkSession> | null = null;

	constructor(getAuthToken: () => Promise<string>, debug = false) {
		this.getAuthToken = getAuthToken;
		this.debug = debug;
		this.loadFromStorage();
	}

	/**
	 * Update the getAuthToken function (called when config changes)
	 */
	updateGetAuthToken(fn: () => Promise<string>): void {
		this.getAuthToken = fn;
	}

	/**
	 * Load session from sessionStorage if valid
	 */
	private loadFromStorage(): void {
		if (typeof window === "undefined") return;

		try {
			const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as SdkSession;
				// Check if session is still valid (with buffer)
				const nowSecs = Math.floor(Date.now() / 1000);
				if (parsed.expiresAt > nowSecs + SESSION_EXPIRY_BUFFER_MS / 1000) {
					this.session = parsed;
				} else {
					// Clear expired session
					sessionStorage.removeItem(SESSION_STORAGE_KEY);
				}
			}
		} catch {
			// Ignore storage errors (private browsing, etc.)
		}
	}

	/**
	 * Save session to sessionStorage
	 */
	private saveToStorage(): void {
		if (typeof window === "undefined" || !this.session) return;

		try {
			sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
		} catch {
			// Ignore storage errors
		}
	}

	/**
	 * Get current session, performing token exchange if needed
	 */
	async getSession(): Promise<SdkSession> {
		// Return existing valid session
		if (this.session) {
			const nowSecs = Math.floor(Date.now() / 1000);
			if (this.session.expiresAt > nowSecs + SESSION_EXPIRY_BUFFER_MS / 1000) {
				if (this.debug) {
					console.info("Using cached session:", this.session.sessionId);
				}
				return this.session;
			}
			if (this.debug) {
				console.info("Cached session expired, refreshing...");
			}
		}

		// Deduplicate concurrent refresh requests
		if (this.refreshPromise) {
			if (this.debug) {
				console.info("Session refresh already in progress, waiting...");
			}
			return this.refreshPromise;
		}

		this.refreshPromise = this.refreshSession();
		try {
			return await this.refreshPromise;
		} finally {
			this.refreshPromise = null;
		}
	}

	/**
	 * Force refresh the session (perform token exchange)
	 */
	async refreshSession(): Promise<SdkSession> {
		// Get auth token from customer's callback
		const authToken = await this.getAuthToken();

		const response = await fetch(this.getApiUrl("/v1/session/exchange"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ handshakeToken: authToken }),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			const message = error.error?.message || "Session exchange failed";
			throw new Error(message);
		}

		const data = await response.json();
		this.session = {
			sessionId: data.session.sessionId,
			expiresAt: data.session.expiresAt,
		};
		this.saveToStorage();

		if (this.debug) {
			console.info("SDK session established:", this.session.sessionId);
		}

		return this.session;
	}

	/**
	 * Get Authorization header value for API requests
	 */
	getAuthHeader(): string | null {
		if (!this.session) {
			return null;
		}
		return `Bearer ${this.session.sessionId}`;
	}

	/**
	 * Get headers object for fetch requests
	 */
	getAuthHeaders(): Record<string, string> {
		const header = this.getAuthHeader();
		if (!header) {
			return {};
		}
		return { Authorization: header };
	}

	/**
	 * Check if session is currently valid
	 */
	isSessionValid(): boolean {
		if (!this.session) return false;
		const nowSecs = Math.floor(Date.now() / 1000);
		return this.session.expiresAt > nowSecs + SESSION_EXPIRY_BUFFER_MS / 1000;
	}

	/**
	 * Clear session from memory and storage
	 */
	clearSession(): void {
		this.session = null;
		if (typeof window !== "undefined") {
			try {
				sessionStorage.removeItem(SESSION_STORAGE_KEY);
			} catch {
				// Ignore storage errors
			}
		}
	}

	/**
	 * Get current session without fetching (returns null if not loaded)
	 */
	getCurrentSession(): SdkSession | null {
		return this.session;
	}

	/**
	 * Get API base URL based on environment
	 */
	private getApiUrl(path: string): string {
		const isLocal =
			typeof window !== "undefined" &&
			(window as { RENUMERATE_LOCAL?: boolean }).RENUMERATE_LOCAL === true;
		const baseUrl = isLocal
			? "https://localhost:4321"
			: "https://api.renumerate.com";
		return `${baseUrl}${path}`;
	}
}
