/**
 * Proxy rotation utility for anti-blocking
 * Note: You'll need to add your own proxy list
 */

class ProxyManager {
  constructor(proxyList = []) {
    this.proxies = proxyList;
    this.currentIndex = 0;
    this.failedProxies = new Set();
  }

  // Get next available proxy
  getNextProxy() {
    if (this.proxies.length === 0) return null;

    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      if (!this.failedProxies.has(proxy)) {
        return proxy;
      }
      attempts++;
    }

    // If all proxies failed, reset and try again
    this.failedProxies.clear();
    return this.proxies[0] || null;
  }

  // Mark proxy as failed
  markFailed(proxy) {
    this.failedProxies.add(proxy);
  }

  // Mark proxy as successful
  markSuccess(proxy) {
    this.failedProxies.delete(proxy);
  }

  // Get proxy configuration for axios
  getAxiosConfig(proxy) {
    if (!proxy) return {};

    return {
      proxy: {
        host: proxy.host,
        port: proxy.port,
        auth: proxy.auth
          ? {
              username: proxy.auth.username,
              password: proxy.auth.password,
            }
          : undefined,
      },
    };
  }

  // Get proxy configuration for Playwright
  getPlaywrightConfig(proxy) {
    if (!proxy) return {};

    return {
      proxy: {
        server: `http://${proxy.host}:${proxy.port}`,
        username: proxy.auth?.username,
        password: proxy.auth?.password,
      },
    };
  }
}

// Example proxy list (you need to add your own)
const EXAMPLE_PROXIES = [
  // Free proxies (not recommended for production)
  // { host: '127.0.0.1', port: 8080 },
  // { host: '127.0.0.1', port: 8081, auth: { username: 'user', password: 'pass' } }
];

export const proxyManager = new ProxyManager(EXAMPLE_PROXIES);

// Helper function to get proxy config
export function getProxyConfig(useProxy = false, type = "axios") {
  if (!useProxy) return {};

  const proxy = proxyManager.getNextProxy();
  if (!proxy) return {};

  if (type === "axios") {
    return proxyManager.getAxiosConfig(proxy);
  } else if (type === "playwright") {
    return proxyManager.getPlaywrightConfig(proxy);
  }

  return {};
}
