import API from "./api";
import type { RunCodeBody, RunCodeResult, LanguageOption } from "../types/code";

export const getSupportedLanguagesAPI = async (): Promise<LanguageOption[]> => {
  const { data } = await API.get("/code-execution/languages");
  return data.data;
};

export const runCodeAPI = async (body: RunCodeBody): Promise<RunCodeResult> => {
  const { data } = await API.post("/code-execution/run", body);
  return data.data;
};