import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role to bypass RLS for public vendor submissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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

    // Verify the token matches the request
    const { data: existingRequest, error: verifyError } = await supabaseAdmin
      .from('requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('token', token)
      .single()

    if (verifyError || !existingRequest) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
    }

    if (existingRequest.status === 'completed') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    // 1. Create the response record
    const { data: response, error: responseError } = await supabaseAdmin
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
    const uploadFile = async (file: File, fileType: 'invoice' | 'contract') => {
      const fileExt = file.name.split('.').pop()
      const filePath = `${token}/${fileType}-${Date.now()}.${fileExt}`

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabaseAdmin.storage
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
      const { error: fileError } = await supabaseAdmin
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
        throw new Error(`Failed to record ${fileType}: ${fileError.message}`)
      }
    }

    if (invoiceFile && invoiceFile.size > 0) {
      await uploadFile(invoiceFile, 'invoice')
    }

    if (contractFile && contractFile.size > 0) {
      await uploadFile(contractFile, 'contract')
    }

    // 3. Mark request as completed
    const { error: updateError } = await supabaseAdmin
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

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Submit error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
