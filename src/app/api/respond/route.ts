import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/resend'
import { getServiceRoleClient } from '@/lib/supabase/service'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import VendorResponseNotification from '@/emails/vendor-response-notification'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_VENDOR_NOTE_LENGTH = 5000

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per hour per IP
  const ip = getClientIp(request)
  const limit = checkRateLimit(ip, { windowMs: 60 * 60 * 1000, maxRequests: 10 })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
    )
  }

  try {
    const formData = await request.formData()
    
    const requestId = formData.get('requestId') as string
    const token = formData.get('token') as string
    const vendorNote = formData.get('vendorNote') as string | null
    const invoiceFile = formData.get('invoiceFile') as File | null
    const contractFile = formData.get('contractFile') as File | null

    if (!requestId || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (vendorNote && vendorNote.length > MAX_VENDOR_NOTE_LENGTH) {
      return NextResponse.json({ error: `Vendor note must be ${MAX_VENDOR_NOTE_LENGTH} characters or less` }, { status: 400 })
    }

    // Verify the token matches the request and get full details for notification
    const { data: existingRequest, error: verifyError } = await getServiceRoleClient()
      .from('requests')
      .select(`
        id, 
        status,
        vendor:vendors (
          id,
          name,
          category,
          wedding:weddings (
            id,
            user_id,
            partner1_name
          )
        )
      `)
      .eq('id', requestId)
      .eq('token', token)
      .single()

    if (verifyError || !existingRequest) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
    }

    if (existingRequest.status === 'completed') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vendorData = existingRequest.vendor as any
    const vendor = {
      id: vendorData.id as string,
      name: vendorData.name as string,
      category: vendorData.category as string,
      wedding: {
        id: vendorData.wedding.id as string,
        user_id: vendorData.wedding.user_id as string,
        partner1_name: vendorData.wedding.partner1_name as string,
      }
    }

    // 1. Create the response record
    const { data: response, error: responseError } = await getServiceRoleClient()
      .from('responses')
      .insert({
        request_id: requestId,
        vendor_note: vendorNote || null
      })
      .select()
      .single()

    if (responseError) {
      console.error('Response insert error:', responseError)
      return NextResponse.json({ error: responseError.message }, { status: 500 })
    }

    // 2. Upload files if provided
    const filesUploaded: string[] = []
    
    const uploadFile = async (file: File, fileType: 'invoice' | 'contract') => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${fileType} exceeds maximum file size of 10MB`)
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`${fileType} has invalid file type. Allowed: PDF, JPG, PNG`)
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${token}/${fileType}-${Date.now()}.${fileExt}`

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await getServiceRoleClient().storage
        .from('vendor-files')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('File upload error:', uploadError)
        throw new Error(`Failed to upload ${fileType}: ${uploadError.message}`)
      }

      // Record file in database
      const { error: fileError } = await getServiceRoleClient()
        .from('files')
        .insert({
          response_id: response.id,
          file_type: fileType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        })

      if (fileError) {
        console.error('File record error:', fileError)
        // Clean up orphaned storage file
        await getServiceRoleClient().storage.from('vendor-files').remove([filePath])
        throw new Error(`Failed to record ${fileType}: ${fileError.message}`)
      }

      // Track for notification
      filesUploaded.push(fileType === 'invoice' ? 'Invoice / Quote' : 'Contract')
    }

    if (invoiceFile && invoiceFile.size > 0) {
      await uploadFile(invoiceFile, 'invoice')
    }

    if (contractFile && contractFile.size > 0) {
      await uploadFile(contractFile, 'contract')
    }

    // 3. Mark request as completed
    const { error: updateError } = await getServiceRoleClient()
      .from('requests')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Request update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Send email notification to bride
    try {
      // Get bride's email from auth.users
      const { data: userData, error: userError } = await getServiceRoleClient().auth.admin.getUserById(
        vendor.wedding.user_id
      )
      
      if (userError || !userData?.user?.email) {
        console.error('Could not get user email for notification:', userError)
      } else {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const dashboardUrl = `${appUrl}/vendors/${vendor.id}`
        
        // Format category for display
        const categoryDisplay = vendor.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
        
        await getResend().emails.send({
          from: 'Wedding Vendor HQ <notifications@send.weddingvendorhq.com>',
          to: userData.user.email,
          subject: `${vendor.name} responded to your request!`,
          react: VendorResponseNotification({
            brideName: vendor.wedding.partner1_name,
            vendorName: vendor.name,
            vendorCategory: categoryDisplay,
            filesUploaded,
            vendorNote: vendorNote || null,
            dashboardUrl,
          }),
        })
        
        console.log('Notification email sent to:', userData.user.email)
      }
    } catch (emailError) {
      // Don't fail the whole request if email fails - just log it
      console.error('[EMAIL_FAILURE] Failed to send vendor response notification:', {
        requestId,
        vendorId: vendor.id,
        error: emailError,
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Submit error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
