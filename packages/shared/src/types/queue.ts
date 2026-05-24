export type JobType = 'discovery' | 'scan' | 'parse' | 'analyze' | 'security'
export type JobStatus = 'pending' | 'running' | 'done' | 'failed' | 'dead'

export interface DiscoveryJobPayload {
  queryId?: string
  force?: boolean
}

export interface ScanJobPayload {
  repositoryId: string
  owner: string
  name: string
  branch?: string
}

export interface ParseJobPayload {
  repositoryId: string
  skillName: string
  filePath: string
  downloadUrl: string
}

export interface AnalyzeJobPayload {
  skillId: string
  rawContent: string
}

export interface SecurityJobPayload {
  skillId: string
  allowedTools: string[]
  hooksDir?: string
}

export type JobPayload =
  | DiscoveryJobPayload
  | ScanJobPayload
  | ParseJobPayload
  | AnalyzeJobPayload
  | SecurityJobPayload
