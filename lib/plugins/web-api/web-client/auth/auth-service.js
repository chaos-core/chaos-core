import axios from "axios";
import jwt from 'jsonwebtoken';

const JWT_TOKEN_KEY = 'auth.jwt';

class AuthService {
  static get currentUser() {
    return jwt.decode(this.jwt);
  }

  static get jwt() {
    return localStorage.getItem(JWT_TOKEN_KEY);
  }

  static set jwt(token) {
    localStorage.setItem(JWT_TOKEN_KEY, token);
  }

  static async login(code) {
    let response = await axios.post("/api/login", { code });
    this.jwt = response.data.jwt;
  }

  static logout() {
    this.jwt = null;
  }
}

export default AuthService;
