// services/userService.ts
export interface User {
  id: string;
  email: string;
  name: string;
  authToken?: string;
}

class UserService {
  private storageKey = 'snowboarder_user';
  private sessionKey = 'snowboarder_session';

  // Initialize user - for demo purposes, we'll create a mock user
  // In a real app, this would handle actual authentication
  initializeUser(): User {
    if (typeof window === 'undefined') {
      return this.createGuestUser();
    }

    let user = this.getCurrentUser();
    
    if (!user) {
      user = this.createGuestUser();
      this.saveUser(user);
    }

    return user;
  }

  private createGuestUser(): User {
    const guestId = this.generateGuestId();
    return {
      id: guestId,
      email: `guest_${guestId}@snowboarder.game`,
      name: `Player_${guestId.slice(-6)}`,
      authToken: `guest_token_${guestId}`
    };
  }

  private generateGuestId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(this.storageKey);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  }

  saveUser(user: User): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    
    // Save individual fields for API headers
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    if (user.authToken) {
      localStorage.setItem('authToken', user.authToken);
    }
  }

  updateUserName(newName: string): void {
    const user = this.getCurrentUser();
    if (user) {
      user.name = newName;
      this.saveUser(user);
    }
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.authToken !== undefined;
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
  }

  // Mock login method - in a real app, this would handle actual authentication
  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const user: User = {
            id: this.generateGuestId(),
            email: email,
            name: email.split('@')[0],
            authToken: `auth_token_${Date.now()}`
          };
          this.saveUser(user);
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  // Mock registration method
  register(email: string, name: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && name && password) {
          const user: User = {
            id: this.generateGuestId(),
            email: email,
            name: name,
            authToken: `auth_token_${Date.now()}`
          };
          this.saveUser(user);
          resolve(user);
        } else {
          reject(new Error('Invalid registration data'));
        }
      }, 1000);
    });
  }
}

export const userService = new UserService();