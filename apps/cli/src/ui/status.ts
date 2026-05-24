import { SUCCESS, ERROR, TEXT_MUTED, TEXT_SECONDARY, PRIMARY, INFO, WARNING, RESET } from './theme'

export function iconSuccess(): string {
  return `${SUCCESS}✓${RESET}`
}

export function iconError(): string {
  return `${ERROR}✗${RESET}`
}

export function iconPending(): string {
  return `${TEXT_MUTED}⏳${RESET}`
}

export function iconBullet(): string {
  return `${TEXT_SECONDARY}▸${RESET}`
}

export function iconSubBullet(): string {
  return `${TEXT_MUTED}▪${RESET}`
}

export function iconStar(): string {
  return `${PRIMARY}★${RESET}`
}

export function iconInfo(): string {
  return `${INFO}ℹ${RESET}`
}

export function iconDiamond(): string {
  return `${PRIMARY}◆${RESET}`
}

export function iconWarning(): string {
  return `${WARNING}⚠${RESET}`
}
