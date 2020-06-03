import axios from "axios";
import jwt from 'jsonwebtoken';

const JWT_TOKEN_KEY = 'auth.jwt';

class AuthService {
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
    let response = await axios.post("/api/login", { code });
    this.setJwt(response.data.jwt);
  }

  static logout() {
    this.setJwt(null);
  }
}

export default AuthService;
