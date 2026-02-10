-- Create vendor_documents table for storing contracts, invoices, etc.
CREATE TABLE vendor_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see documents for their own vendors
CREATE POLICY "Users can view own vendor documents"
  ON vendor_documents FOR SELECT
  USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (SELECT auth.uid())
    )
  );

-- Policy: Users can insert documents for their own vendors
CREATE POLICY "Users can insert own vendor documents"
  ON vendor_documents FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (SELECT auth.uid())
    )
  );

-- Policy: Users can delete their own vendor documents
CREATE POLICY "Users can delete own vendor documents"
  ON vendor_documents FOR DELETE
  USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (SELECT auth.uid())
    )
  );

-- Index for faster lookups
CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
