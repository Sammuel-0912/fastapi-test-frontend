// 模組層級變數：存放在記憶體中，Interceptor 可以隨時讀取
let token: string | null = null;

export function getToken(): string | null {
    return token;
}

export function setToken(newToken: string | null): void {
  token = newToken;
}
