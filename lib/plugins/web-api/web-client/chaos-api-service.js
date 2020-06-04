import axios from "axios";
import AuthService from "./auth/auth-service.js";

const request = (method, path, data = undefined) => axios({
  method: method,
  url: path,
  data: data,
  headers: { authorization: `bearer ${AuthService.getJwt()}` }
});

const get = (path) => request("GET", path);
const post = (path, data) => request("POST", path, data);

const ChaosApiService = {
  login: ({ code }) => post('/api/login', { code }),
};

export default ChaosApiService;
