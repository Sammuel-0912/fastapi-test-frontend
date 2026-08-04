export interface AppConfig {VITE_API_BASE_URL: string};
export let appConfig: AppConfig = {VITE_API_BASE_URL: ""};

export function setConfig(c: AppConfig){appConfig = c;};