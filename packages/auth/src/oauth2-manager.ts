import axios from 'axios';
import crypto from 'crypto';
import { OAuth2Provider, OAuth2TokenResponse, OAuth2UserInfo } from './auth.types';

export class OAuth2Manager {
  private providers: Map<string, OAuth2Provider> = new Map();
  private states: Map<string, { provider: string; createdAt: number }> = new Map();

  constructor(providers: Record<string, OAuth2Provider>) {
    Object.entries(providers).forEach(([key, provider]) => {
      this.providers.set(key, provider);
    });

    // Clean up expired states every 10 minutes
    setInterval(() => this.cleanupExpiredStates(), 10 * 60 * 1000);
  }

  /**
   * Generate authorization URL for OAuth2 provider
   */
  getAuthorizationUrl(providerName: string): string {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`OAuth2 provider '${providerName}' not configured`);
    }

    const state = this.generateState(providerName);

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      scope: provider.scope,
      response_type: 'code',
      state,
    });

    return `${provider.authorizeUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    providerName: string,
    code: string,
    state: string
  ): Promise<OAuth2TokenResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`OAuth2 provider '${providerName}' not configured`);
    }

    // Verify state parameter
    if (!this.verifyState(state, providerName)) {
      throw new Error('Invalid state parameter');
    }

    try {
      const response = await axios.post(
        provider.tokenUrl,
        {
          grant_type: 'authorization_code',
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          redirect_uri: provider.redirectUri,
          code,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in || 3600,
        scope: response.data.scope,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OAuth2 token exchange failed: ${error.response?.data?.error_description || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get user information from OAuth2 provider
   */
  async getUserInfo(providerName: string, accessToken: string): Promise<OAuth2UserInfo> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`OAuth2 provider '${providerName}' not configured`);
    }

    try {
      const response = await axios.get(provider.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      return this.normalizeUserInfo(providerName, response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get user info: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Refresh OAuth2 access token
   */
  async refreshToken(providerName: string, refreshToken: string): Promise<OAuth2TokenResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`OAuth2 provider '${providerName}' not configured`);
    }

    try {
      const response = await axios.post(
        provider.tokenUrl,
        {
          grant_type: 'refresh_token',
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in || 3600,
        scope: response.data.scope,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OAuth2 token refresh failed: ${error.response?.data?.error_description || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate secure state parameter
   */
  private generateState(providerName: string): string {
    const state = crypto.randomBytes(32).toString('hex');
    this.states.set(state, {
      provider: providerName,
      createdAt: Date.now(),
    });
    return state;
  }

  /**
   * Verify state parameter
   */
  private verifyState(state: string, expectedProvider: string): boolean {
    const stateData = this.states.get(state);
    if (!stateData) {
      return false;
    }

    // Check if state is expired (valid for 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (stateData.createdAt < tenMinutesAgo) {
      this.states.delete(state);
      return false;
    }

    // Check if provider matches
    if (stateData.provider !== expectedProvider) {
      return false;
    }

    // Remove used state
    this.states.delete(state);
    return true;
  }

  /**
   * Clean up expired states
   */
  private cleanupExpiredStates(): void {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    for (const [state, data] of this.states.entries()) {
      if (data.createdAt < tenMinutesAgo) {
        this.states.delete(state);
      }
    }
  }

  /**
   * Normalize user info from different providers
   */
  private normalizeUserInfo(providerName: string, rawData: any): OAuth2UserInfo {
    switch (providerName) {
      case 'google':
        return {
          id: rawData.id,
          email: rawData.email,
          name: rawData.name,
          username: rawData.email,
          avatar: rawData.picture,
          provider: 'google',
        };

      case 'github':
        return {
          id: rawData.id.toString(),
          email: rawData.email,
          name: rawData.name,
          username: rawData.login,
          avatar: rawData.avatar_url,
          provider: 'github',
        };

      default:
        return {
          id: rawData.id?.toString() || rawData.sub,
          email: rawData.email,
          name: rawData.name || rawData.display_name,
          username: rawData.username || rawData.preferred_username || rawData.email,
          avatar: rawData.picture || rawData.avatar_url,
          provider: providerName,
        };
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(providerName: string): boolean {
    return this.providers.has(providerName);
  }
}