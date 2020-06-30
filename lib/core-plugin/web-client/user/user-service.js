import jwt from 'jsonwebtoken';
import ChaosApiClient from '../chaos-api-client.js';

const JWT_TOKEN_KEY = 'auth.jwt';

class UserService {
  static getUser() {
    return jwt.decode(this.getJwt());
  }

  static getJwt() {
    return localStorage.getItem(JWT_TOKEN_KEY);
  }

  static setJwt(token) {
    localStorage.setItem(JWT_TOKEN_KEY, token);
  }

  static async login(code) {
    let data = await ChaosApiClient.login({code});
    this.setJwt(data.jwt);
  }

  static logout() {
    this.setJwt(null);
  }
}

export default UserService;
