/**
 * FERPA Compliance Service
 * 
 * Implements educational data privacy compliance following Context7 Fides patterns
 * Handles PII encryption, consent management, and data subject rights
 * 
 * @security FERPA-compliant educational data protection
 * @pattern Context7 Fides privacy engineering framework
 */

import { withTenantContext } from '../database/multi-tenant-utils'
import { trackUserAction } from '../database/performance-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MTDatabaseOperation } from '../../types/tenant'
import crypto from 'crypto'

// ============================================================================
// FERPA COMPLIANCE TYPES
// ============================================================================

export interface TenantEncryptionKey {
  tenant_id: string
  key_id: string
  key_version: number
  encryption_algorithm: string
  created_at: string
  last_rotated: string
  next_rotation?: string
  rotation_frequency_days: number
  status: 'active' | 'rotating' | 'deprecated'
  key_metadata: Record<string, any>
  ferpa_compliance_level: 'standard' | 'enhanced' | 'maximum'
  data_retention_days: number
}

export interface UserProfileEncrypted {
  tenant_id: string
  id: string
  email_encrypted?: string
  email_hash: string
  full_name_encrypted?: string
  full_name_hash: string
  target_test_date?: string
  current_scores: Record<string, number>
  target_scores: Record<string, number>
  subscription_tier: 'free' | 'premium' | 'early_adopter'
  preferences_encrypted?: string
  preferences_hash: string
  ferpa_consent_given: boolean
  ferpa_consent_date?: string
  ferpa_consent_version: string
  data_retention_expires?: string
  created_at: string
  updated_at: string
  last_active: string
}

export interface FerpaConsentRecord {
  tenant_id: string
  id: string
  user_id: string
  consent_type: 'educational_records' | 'directory_info' | 'research'
  consent_status: 'granted' | 'denied' | 'withdrawn' | 'expired'
  consent_version: string
  granted_at?: string
  denied_at?: string
  withdrawn_at?: string
  expires_at?: string
  consent_method: 'web_form' | 'email' | 'paper' | 'verbal'
  ip_address?: string
  user_agent?: string
  parent_guardian_name_encrypted?: string
  parent_guardian_email_encrypted?: string
  minor_age?: number
  created_at: string
  updated_at: string
}

export interface DataSubjectRequest {
  tenant_id: string
  id: string
  user_id?: string
  request_type: 'access' | 'deletion' | 'correction' | 'portability'
  status: 'submitted' | 'processing' | 'completed' | 'cancelled' | 'failed'
  identity_verified: boolean
  identity_verification_method?: string
  identity_verified_at?: string
  identity_verified_by?: string
  submitted_at: string
  processing_started_at?: string
  completed_at?: string
  deadline: string
  requested_data_types: string[]
  processing_notes?: string
  fulfillment_method: 'download_link' | 'email' | 'postal_mail'
  contact_email_encrypted?: string
  contact_name_encrypted?: string
  request_source: 'privacy_center' | 'email' | 'phone' | 'mail'
  created_at: string
  updated_at: string
}

export interface AuditLogFerpa {
  tenant_id: string
  id: string
  user_id?: string
  actor_id?: string
  actor_role?: string
  action: string
  table_name: string
  record_id?: string
  old_values_masked?: Record<string, any>
  new_values_masked?: Record<string, any>
  pii_fields_affected: string[]
  created_at: string
  ip_address?: string
  user_agent?: string
  request_id?: string
  session_id?: string
  ferpa_purpose: string
  ferpa_justification: string
  data_sensitivity_level: 'low' | 'standard' | 'high' | 'critical'
  retention_expires?: string
  auto_purge_eligible: boolean
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

export class EncryptionManager {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  /**
   * Encrypt PII data using tenant-specific encryption
   */
  static encryptPII(data: string, tenantKey: string): string {
    const iv = crypto.randomBytes(EncryptionManager.IV_LENGTH)
    const cipher = crypto.createCipher(EncryptionManager.ALGORITHM, tenantKey)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // In production, use proper key management (AWS KMS, etc.)
    // This is a simplified implementation for demonstration
    return `${iv.toString('hex')}:${encrypted}`
  }

  /**
   * Decrypt PII data using tenant-specific encryption
   */
  static decryptPII(encryptedData: string, tenantKey: string): string {
    const [ivHex, encrypted] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipher(EncryptionManager.ALGORITHM, tenantKey)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Create SHA-256 hash for searchable fields (Context7 Fides pattern)
   */
  static createSearchableHash(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
  }

  /**
   * Mask PII for audit logs (Context7 Fides masking pattern)
   */
  static maskPIIForAudit(data: Record<string, any>): Record<string, any> {
    const masked = { ...data }
    const piiFields = ['email', 'full_name', 'phone', 'address', 'ssn']
    
    for (const field of piiFields) {
      if (masked[field]) {
        if (typeof masked[field] === 'string') {
          // Mask email: j***@***.com
          if (field === 'email') {
            const email = masked[field] as string
            const [local, domain] = email.split('@')
            masked[field] = `${local[0]}***@***.${domain.split('.').pop()}`
          } else {
            // Mask other fields: J*** D***
            const words = (masked[field] as string).split(' ')
            masked[field] = words.map(word => `${word[0]}***`).join(' ')
          }
        }
      }
    }
    
    return masked
  }
}

// ============================================================================
// FERPA COMPLIANCE SERVICE
// ============================================================================

export class FerpaComplianceService {
  private static instance: FerpaComplianceService

  static getInstance(): FerpaComplianceService {
    if (!FerpaComplianceService.instance) {
      FerpaComplianceService.instance = new FerpaComplianceService()
    }
    return FerpaComplianceService.instance
  }

  // ============================================================================
  // ENCRYPTION KEY MANAGEMENT
  // ============================================================================

  /**
   * Initialize encryption keys for tenant
   */
  async initializeTenantEncryption(
    tenantId: string,
    keyId: string,
    complianceLevel: 'standard' | 'enhanced' | 'maximum' = 'standard'
  ): Promise<MTDatabaseOperation<TenantEncryptionKey>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const keyData = {
          tenant_id: tenantId,
          key_id: keyId,
          key_version: 1,
          encryption_algorithm: 'AES-256-GCM',
          last_rotated: new Date().toISOString(),
          rotation_frequency_days: 90,
          status: 'active',
          key_metadata: {},
          ferpa_compliance_level: complianceLevel,
          data_retention_days: complianceLevel === 'maximum' ? 2555 : 1825 // 7 years vs 5 years
        }

        const { data, error } = await client
          .from('tenant_encryption_keys')
          .insert(keyData)
          .select()
          .single()

        return { data: data as TenantEncryptionKey, error }
      })

      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // PII ENCRYPTION MANAGEMENT
  // ============================================================================

  /**
   * Create encrypted user profile with PII protection
   */
  async createEncryptedUserProfile(
    tenantId: string,
    userId: string,
    email: string,
    fullName?: string,
    preferences?: Record<string, any>
  ): Promise<MTDatabaseOperation<UserProfileEncrypted>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        // In production, retrieve actual encryption key from AWS KMS
        const tenantKey = `tenant_${tenantId}_key` // Simplified for demo
        
        const profileData = {
          tenant_id: tenantId,
          id: userId,
          email_encrypted: EncryptionManager.encryptPII(email, tenantKey),
          email_hash: EncryptionManager.createSearchableHash(email),
          full_name_encrypted: fullName ? EncryptionManager.encryptPII(fullName, tenantKey) : null,
          full_name_hash: fullName ? EncryptionManager.createSearchableHash(fullName) : '',
          current_scores: {},
          target_scores: {},
          subscription_tier: 'free',
          preferences_encrypted: preferences ? EncryptionManager.encryptPII(JSON.stringify(preferences), tenantKey) : null,
          preferences_hash: preferences ? EncryptionManager.createSearchableHash(JSON.stringify(preferences)) : '',
          ferpa_consent_given: false,
          ferpa_consent_version: '1.0'
        }

        const { data, error } = await client
          .from('user_profiles_encrypted')
          .insert(profileData)
          .select()
          .single()

        if (!error) {
          // Log PII creation in FERPA audit log
          await this.logFerpaAuditEvent(
            tenantId,
            client,
            userId,
            userId,
            'CREATE',
            'user_profiles_encrypted',
            userId,
            {},
            EncryptionManager.maskPIIForAudit({ email, full_name: fullName }),
            ['email_encrypted', 'full_name_encrypted'],
            'educational_record',
            'User profile creation with PII encryption'
          )
        }

        return { data: data as UserProfileEncrypted, error }
      })

      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Decrypt user PII data with consent validation
   */
  async decryptUserPII(
    tenantId: string,
    userId: string,
    requestorId: string,
    purpose: string
  ): Promise<MTDatabaseOperation<{ email: string; fullName?: string; preferences?: any }>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        // Check FERPA consent
        const consentValid = await this.checkFerpaConsent(client, tenantId, userId, 'educational_records')
        
        if (!consentValid) {
          throw new Error('FERPA consent required for PII access')
        }

        // Get encrypted profile
        const { data: profile, error } = await client
          .from('user_profiles_encrypted')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('id', userId)
          .single()

        if (error) throw error

        // In production, retrieve actual encryption key from AWS KMS
        const tenantKey = `tenant_${tenantId}_key`
        
        const decryptedData = {
          email: profile.email_encrypted ? EncryptionManager.decryptPII(profile.email_encrypted, tenantKey) : '',
          fullName: profile.full_name_encrypted ? EncryptionManager.decryptPII(profile.full_name_encrypted, tenantKey) : undefined,
          preferences: profile.preferences_encrypted ? JSON.parse(EncryptionManager.decryptPII(profile.preferences_encrypted, tenantKey)) : undefined
        }

        // Log PII access in FERPA audit log
        await this.logFerpaAuditEvent(
          tenantId,
          client,
          userId,
          requestorId,
          'ACCESS_PII',
          'user_profiles_encrypted',
          userId,
          {},
          {},
          ['email_encrypted', 'full_name_encrypted', 'preferences_encrypted'],
          purpose,
          `PII decryption access by user ${requestorId}`
        )

        return { data: decryptedData, error: null }
      })

      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // FERPA CONSENT MANAGEMENT
  // ============================================================================

  /**
   * Record FERPA consent from user
   */
  async recordFerpaConsent(
    tenantId: string,
    userId: string,
    consentType: 'educational_records' | 'directory_info' | 'research',
    consentGranted: boolean,
    method: 'web_form' | 'email' | 'paper' | 'verbal',
    ipAddress?: string,
    userAgent?: string
  ): Promise<MTDatabaseOperation<FerpaConsentRecord>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const consentData = {
          tenant_id: tenantId,
          user_id: userId,
          consent_type: consentType,
          consent_status: consentGranted ? 'granted' : 'denied',
          consent_version: '1.0',
          granted_at: consentGranted ? new Date().toISOString() : null,
          denied_at: !consentGranted ? new Date().toISOString() : null,
          expires_at: consentGranted ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null, // 1 year
          consent_method: method,
          ip_address: ipAddress || null,
          user_agent: userAgent || null
        }

        const { data, error } = await client
          .from('ferpa_consent_records')
          .insert(consentData)
          .select()
          .single()

        if (!error) {
          // Update user profile consent status
          await client
            .from('user_profiles_encrypted')
            .update({
              ferpa_consent_given: consentGranted,
              ferpa_consent_date: new Date().toISOString()
            })
            .eq('tenant_id', tenantId)
            .eq('id', userId)

          await trackUserAction(userId, 'FERPA_CONSENT', 'ferpa_consent_records', data?.id)
        }

        return { data: data as FerpaConsentRecord, error }
      })

      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Check if user has valid FERPA consent
   */
  private async checkFerpaConsent(
    client: SupabaseClient,
    tenantId: string,
    userId: string,
    consentType: string
  ): Promise<boolean> {
    const { data, error } = await client
      .from('ferpa_consent_records')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .eq('consent_status', 'granted')
      .gt('expires_at', new Date().toISOString())
      .single()

    return !!data && !error
  }

  // ============================================================================
  // DATA SUBJECT RIGHTS (FERPA + CCPA/GDPR)
  // ============================================================================

  /**
   * Submit data subject request (Context7 Fides pattern)
   */
  async submitDataSubjectRequest(
    tenantId: string,
    userId: string,
    requestType: 'access' | 'deletion' | 'correction' | 'portability',
    requestedDataTypes: string[],
    contactEmail?: string
  ): Promise<MTDatabaseOperation<DataSubjectRequest>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        // Calculate deadline (45 days for FERPA)
        const deadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        
        const requestData = {
          tenant_id: tenantId,
          user_id: userId,
          request_type: requestType,
          status: 'submitted',
          identity_verified: false,
          deadline: deadline.toISOString(),
          requested_data_types: requestedDataTypes,
          fulfillment_method: 'download_link',
          contact_email_encrypted: contactEmail ? EncryptionManager.encryptPII(contactEmail, `tenant_${tenantId}_key`) : null,
          request_source: 'privacy_center'
        }

        const { data, error } = await client
          .from('data_subject_requests')
          .insert(requestData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(userId, 'DATA_SUBJECT_REQUEST', 'data_subject_requests', data?.id)
        }

        return { data: data as DataSubjectRequest, error }
      })

      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // FERPA AUDIT LOGGING
  // ============================================================================

  /**
   * Log FERPA-compliant audit event
   */
  private async logFerpaAuditEvent(
    tenantId: string,
    client: SupabaseClient,
    userId: string,
    actorId: string,
    action: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    piiFields: string[],
    purpose: string,
    justification: string,
    sensitivityLevel: 'low' | 'standard' | 'high' | 'critical' = 'standard'
  ): Promise<void> {
    const auditData = {
      tenant_id: tenantId,
      user_id: userId,
      actor_id: actorId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values_masked: EncryptionManager.maskPIIForAudit(oldValues),
      new_values_masked: EncryptionManager.maskPIIForAudit(newValues),
      pii_fields_affected: piiFields,
      ferpa_purpose: purpose,
      ferpa_justification: justification,
      data_sensitivity_level: sensitivityLevel,
      retention_expires: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 years
      auto_purge_eligible: true
    }

    await client
      .from('audit_logs_ferpa')
      .insert(auditData)
  }

  // ============================================================================
  // DATA RETENTION AND CLEANUP
  // ============================================================================

  /**
   * Execute automated data cleanup based on FERPA retention schedules
   */
  async executeDataRetentionCleanup(tenantId: string): Promise<{ cleanedRecords: number; errors: string[] }> {
    const errors: string[] = []
    let totalCleaned = 0

    try {
      await withTenantContext(tenantId, async (client: SupabaseClient) => {
        // Clean expired audit logs
        const { data: expiredAudits, error: auditError } = await client
          .from('audit_logs_ferpa')
          .delete()
          .eq('tenant_id', tenantId)
          .lt('retention_expires', new Date().toISOString())
          .eq('auto_purge_eligible', true)

        if (auditError) {
          errors.push(`Audit log cleanup error: ${auditError.message}`)
        } else {
          totalCleaned += (expiredAudits as any)?.length || 0
        }

        // Clean expired consent records
        const { data: expiredConsents, error: consentError } = await client
          .from('ferpa_consent_records')
          .delete()
          .eq('tenant_id', tenantId)
          .lt('expires_at', new Date().toISOString())
          .eq('consent_status', 'denied')

        if (consentError) {
          errors.push(`Consent record cleanup error: ${consentError.message}`)
        } else {
          totalCleaned += (expiredConsents as any)?.length || 0
        }

        // Clean completed data subject requests older than 1 year
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        const { data: oldRequests, error: requestError } = await client
          .from('data_subject_requests')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('status', 'completed')
          .lt('completed_at', oneYearAgo.toISOString())

        if (requestError) {
          errors.push(`Data subject request cleanup error: ${requestError.message}`)
        } else {
          totalCleaned += (oldRequests as any)?.length || 0
        }
      })
    } catch (error) {
      errors.push(`General cleanup error: ${error}`)
    }

    return { cleanedRecords: totalCleaned, errors }
  }
}

// Export singleton instance
export const ferpaComplianceService = FerpaComplianceService.getInstance()