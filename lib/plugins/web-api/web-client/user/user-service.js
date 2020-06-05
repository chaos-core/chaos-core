import jwt from 'jsonwebtoken';
import ChaosApiService from "../chaos-api-service.js";

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
    let data = await ChaosApiService.login({ code });
    this.setJwt(data.jwt);
  }

  static logout() {
    this.setJwt(null);
  }
}

export default UserService;
