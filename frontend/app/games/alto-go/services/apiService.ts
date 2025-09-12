export interface SaveScoreRequest {
  score: number;
}

export interface ScoreResponse {
  id: number;
  playerId: string;
  playerName: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;
  private retryAttempts: number = 3;
  private timeout: number = 10000; // 10 seconds

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // <-- This is the key change
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different HTTP status codes
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized - Please login again');
          case 403:
            throw new Error('Forbidden - Access denied');
          case 404:
            throw new Error('Endpoint not found');
          case 500:
            throw new Error('Server error - Please try again later');
          default:
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Please check your connection');
        }
        
        // Network errors - retry if attempts remaining
        if (error.message.includes('fetch') && retryCount < this.retryAttempts) {
          console.warn(`Request failed, retrying... (${retryCount + 1}/${this.retryAttempts})`);
          await this.delay(1000 * (retryCount + 1)); // Exponential backoff
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveScore(scoreRequest: SaveScoreRequest): Promise<ApiResponse<ScoreResponse>> {
    try {
      const response = await this.makeRequest<ScoreResponse>('/api/v1/game/snowboarder/save', {
        method: 'POST',
        body: JSON.stringify(scoreRequest),
      });

      // Store the score locally as backup
      this.storeScoreLocally(scoreRequest.score, true);
      
      return response;
    } catch (error) {
      // Store score locally if request fails
      this.storeScoreLocally(scoreRequest.score, false);
      throw error;
    }
  }

  async getTop10Scores(): Promise<ApiResponse<ScoreResponse[]>> {
    try {
      return await this.makeRequest<ScoreResponse[]>('/api/v1/game/snowboarder/top10', {
        method: 'GET',
      });
    } catch (error) {
      // Return offline scores if available
      const offlineScores = this.getOfflineScores();
      if (offlineScores.length > 0) {
        console.warn('Backend unavailable, returning offline scores');
        return {
          success: true,
          message: 'Offline scores loaded',
          data: offlineScores,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  async getPersonalBest(): Promise<ApiResponse<ScoreResponse | null>> {
    try {
      return await this.makeRequest<ScoreResponse | null>('/api/v1/game/snowboarder/personal-best', {
        method: 'GET',
      });
    } catch (error) {
      // Return offline personal best if available
      const offlineHighScore = localStorage.getItem('snowboarder_highscore');
      if (offlineHighScore && parseInt(offlineHighScore) > 0) {
        const userId = localStorage.getItem('userId') || 'offline';
        const userName = localStorage.getItem('userName') || 'You';
        
        console.warn('Backend unavailable, returning offline personal best');
        return {
          success: true,
          message: 'Offline personal best loaded',
          data: {
            id: 1,
            playerId: userId,
            playerName: userName,
            score: parseInt(offlineHighScore),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  async getMyScores(): Promise<ApiResponse<ScoreResponse[]>> {
    try {
      return await this.makeRequest<ScoreResponse[]>('/api/v1/game/snowboarder/my-scores', {
        method: 'GET',
      });
    } catch (error) {
      // Return offline personal scores if available
      const offlineScores = this.getOfflinePersonalScores();
      if (offlineScores.length > 0) {
        console.warn('Backend unavailable, returning offline personal scores');
        return {
          success: true,
          message: 'Offline personal scores loaded',
          data: offlineScores,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  async getPlayerScores(playerId: string): Promise<ApiResponse<ScoreResponse[]>> {
    return this.makeRequest<ScoreResponse[]>(`/api/v1/game/snowboarder/player/${playerId}`, {
      method: 'GET',
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/game/snowboarder/top10`, {
        method: 'HEAD',
        credentials: 'include', // <-- Also added here for consistency
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private storeScoreLocally(score: number, uploaded: boolean): void {
    if (typeof window === 'undefined') return;

    try {
      const localScores = JSON.parse(localStorage.getItem('snowboarder_offline_scores') || '[]');
      const userId = localStorage.getItem('userId') || 'anonymous';
      const userName = localStorage.getItem('userName') || 'Anonymous';
      
      localScores.push({
        id: Date.now(),
        playerId: userId,
        playerName: userName,
        score: score,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploaded: uploaded
      });

      // Keep only the last 50 scores to avoid localStorage bloat
      if (localScores.length > 50) {
        localScores.splice(0, localScores.length - 50);
      }

      localStorage.setItem('snowboarder_offline_scores', JSON.stringify(localScores));

      // Update high score if this is better
      const currentHighScore = parseInt(localStorage.getItem('snowboarder_highscore') || '0');
      if (score > currentHighScore) {
        localStorage.setItem('snowboarder_highscore', score.toString());
      }
    } catch (error) {
      console.error('Failed to store score locally:', error);
    }
  }

  private getOfflineScores(): ScoreResponse[] {
    if (typeof window === 'undefined') return [];

    try {
      const localScores = JSON.parse(localStorage.getItem('snowboarder_offline_scores') || '[]');
      
      // Create a map to get the highest score per player
      const playerBestScores = new Map<string, ScoreResponse>();
      
      localScores.forEach((score: any) => {
        const existing = playerBestScores.get(score.playerId);
        if (!existing || score.score > existing.score) {
          playerBestScores.set(score.playerId, score);
        }
      });

      // Convert to array and sort by score
      let topScores = Array.from(playerBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Add some dummy scores if we don't have enough
      const dummyScores = [
        { id: 1001, playerId: 'ai_player_1', playerName: 'SnowPro', score: 8500 },
        { id: 1002, playerId: 'ai_player_2', playerName: 'ChillRider', score: 7200 },
        { id: 1003, playerId: 'ai_player_3', playerName: 'IceBreaker', score: 6800 },
        { id: 1004, playerId: 'ai_player_4', playerName: 'SlopeStorm', score: 5900 },
        { id: 1005, playerId: 'ai_player_5', playerName: 'FrostFlyer', score: 5100 }
      ];

      dummyScores.forEach(dummy => {
        if (topScores.length < 10 && !topScores.some(s => s.score >= dummy.score)) {
          topScores.push({
            ...dummy,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      return topScores.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      console.error('Failed to get offline scores:', error);
      return [];
    }
  }

  private getOfflinePersonalScores(): ScoreResponse[] {
    if (typeof window === 'undefined') return [];

    try {
      const localScores = JSON.parse(localStorage.getItem('snowboarder_offline_scores') || '[]');
      const userId = localStorage.getItem('userId');
      
      if (!userId) return [];

      return localScores
        .filter((score: any) => score.playerId === userId)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to get offline personal scores:', error);
      return [];
    }
  }

  async uploadPendingScores(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const localScores = JSON.parse(localStorage.getItem('snowboarder_offline_scores') || '[]');
      const pendingScores = localScores.filter((score: any) => !score.uploaded);

      for (const score of pendingScores) {
        try {
          await this.saveScore({ score: score.score });
          // Mark as uploaded
          score.uploaded = true;
        } catch (error) {
          console.warn('Failed to upload pending score:', score.score, error);
          break; // Stop if upload fails
        }
      }

      // Update localStorage with upload status
      localStorage.setItem('snowboarder_offline_scores', JSON.stringify(localScores));
      
      if (pendingScores.length > 0) {
        console.log(`Successfully uploaded ${pendingScores.filter((s: any) => s.uploaded).length} pending scores`);
      }
    } catch (error) {
      console.error('Failed to upload pending scores:', error);
    }
  }
}

export const apiService = new ApiService();
