function getProviderLoginUrl(provider: 'google' | 'facebook' | 'github' | 'okta') {
    return `http://localhost:8080/oauth2/authorization/${provider}`
};

export {getProviderLoginUrl};