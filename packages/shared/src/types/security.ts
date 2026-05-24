export interface SecurityFinding {
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  codeSnippet?: string
}

export interface SecurityReport {
  scannerVersion: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  findings: SecurityFinding[]
}

export interface SecurityRule {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  analyze(tools: string[], hooks: string[], description?: string): SecurityFinding[]
}
