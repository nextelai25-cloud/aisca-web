import { supabaseAdmin } from './supabase'

/**
 * Verifies a membership number belongs to an approved associate member.
 * Returns the member's real name/school (from the DB) or null.
 * Used by IdeaNet routes so posts/comments/votes cannot be forged.
 */
export async function verifyApprovedMember(membershipNumber: unknown): Promise<{
  membership_number: string
  full_name: string
  school: string
} | null> {
  if (typeof membershipNumber !== 'string' || !/^AISCA-\d{4}-\d{5}$/.test(membershipNumber)) {
    return null
  }
  const { data } = await supabaseAdmin
    .from('associate_members')
    .select('membership_number, full_name, school')
    .eq('membership_number', membershipNumber)
    .eq('status', 'approved')
    .single()

  if (!data) return null
  return {
    membership_number: data.membership_number,
    full_name: data.full_name,
    school: data.school || ''
  }
}
