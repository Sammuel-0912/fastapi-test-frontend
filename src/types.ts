// 基礎機台欄位 (對應 Pydantic MachineBase)
export interface MachineBase {
    name: string;
    status: string | null;
    location: string | null;
}

// 瘦身版列表 Response (對應 Pydantic MachineListResponse，無 logs)
export interface MachineListResponse extends MachineBase {
  id: number;
}

// 補上MachineResponse
export interface MachineResponse extends MachineBase {
  id: number;
  logs: LogResponse[];
}
// 日誌 Response (對應 Pydantic LogResponse)
export interface LogResponse {
  id: number;
  machine_id: number;
  message: string;
}

// 使用者 Response (對應 Pydantic UserResponse)
export interface UserResponse {
  id: number;
  username: string;
  role: string;
}

// JWT Token (對應 Pydantic Token)
export interface Token {
  access_token: string;
  token_type: string;
}