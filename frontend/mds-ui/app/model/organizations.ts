import type { AgentModel } from '~~/api-client/generated/iop-core'
import { localize } from '~/utils/getCurrentTranslation'

/**
 * An organization is an iop-core agent. Agents returned by iop-core always have an id.
 * Pages link to organizations by their identifier, which is also what GET /api/Search filters publishers by.
 */
export type Organization = AgentModel & { id: string }

export interface OrganizationTreeNode {
  id: string
  organization: Organization
  children: OrganizationTreeNode[]
}

/**
 * Get the name of an organization in the given language, falling back to its preferred label and its identifier.
 */
export function organizationLabel(organization: AgentModel, lang: string) {
  return localize(organization.name, lang) || localize(organization.prefLabel, lang) || organization.identifier || ''
}

/**
 * Get the homepage of the organization with the given identifier, if it is one of the organizations.
 */
export function organizationHomepage(organizations: AgentModel[], identifier: string | undefined) {
  const wanted = identifier?.toLowerCase()
  if (!wanted) {
    return undefined
  }
  return organizations.find(organization => organization.identifier?.toLowerCase() === wanted)?.homePage ?? undefined
}

/**
 * Get the id of the parent organization, if any.
 */
export function getParentId(organization: AgentModel) {
  return organization.subOrganizationOf?.id
}
