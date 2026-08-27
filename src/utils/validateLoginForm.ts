// 純函式驗證：只驗證是否填寫，絕不驗證長度！（抽成獨立檔案以便單元測試與符合 react-refresh 規則）
export const validateLoginForm = (username: string, password: string) => {
  return {
    username: !username.trim() ? "請輸入帳號" : "",
    password: !password ? "請輸入密碼" : "",
  };
};
