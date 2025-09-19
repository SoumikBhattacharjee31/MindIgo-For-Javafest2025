const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getProviderLoginUrl(
  provider: "google" | "facebook" | "github" | "okta"
) {
  return `${API_BASE_URL}/oauth2/authorization/${provider}`;
}

export { getProviderLoginUrl };
