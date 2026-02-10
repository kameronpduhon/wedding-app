# Wedding App Setup Instructions 🦈

Hey Kameron! Run these when you get home. Two features need database setup:

---

## 1️⃣ Vendor Drag-and-Drop Reordering

**Go to Supabase → SQL Editor and run this:**

```sql
-- Add position column to vendors for drag-and-drop reordering
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS position INTEGER;

-- Set initial positions based on creation date
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY wedding_id ORDER BY created_at) as rn
  FROM vendors
)
UPDATE vendors 
SET position = ranked.rn
FROM ranked
WHERE vendors.id = ranked.id;

-- Make position NOT NULL with default
ALTER TABLE vendors ALTER COLUMN position SET DEFAULT 0;
```

✅ That's it for drag-and-drop!

---

## 2️⃣ Vendor Documents (Contracts, Invoices, etc.)

### Step A: Create the Storage Bucket

1. Go to **Supabase → Storage** (left sidebar)
2. Click **"New Bucket"**
3. Name it: `vendor-documents`
4. Toggle **"Public bucket"** to **OFF** (keep it private)
5. Click **"Create bucket"**

### Step B: Set Storage Policies

1. Click on the `vendor-documents` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"** → **"For full customization"**

**Policy 1 - SELECT (download):**
- Policy name: `Users can download own vendor docs`
- Allowed operation: `SELECT`
- Policy definition:
```sql
((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (vendors.id)::text AS id
   FROM (vendors
     JOIN weddings ON ((vendors.wedding_id = weddings.id)))
  WHERE (weddings.user_id = ( SELECT auth.uid() AS uid)))))
```

**Policy 2 - INSERT (upload):**
- Policy name: `Users can upload to own vendor docs`
- Allowed operation: `INSERT`
- Policy definition:
```sql
((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (vendors.id)::text AS id
   FROM (vendors
     JOIN weddings ON ((vendors.wedding_id = weddings.id)))
  WHERE (weddings.user_id = ( SELECT auth.uid() AS uid)))))
```

**Policy 3 - DELETE:**
- Policy name: `Users can delete own vendor docs`
- Allowed operation: `DELETE`
- Policy definition:
```sql
((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (vendors.id)::text AS id
   FROM (vendors
     JOIN weddings ON ((vendors.wedding_id = weddings.id)))
  WHERE (weddings.user_id = ( SELECT auth.uid() AS uid)))))
```

### Step C: Create the Documents Table

**Go to Supabase → SQL Editor and run this:**

```sql
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
```

✅ Done! Documents feature is ready.

---

## Quick Checklist

- [ ] Run drag-and-drop SQL
- [ ] Create `vendor-documents` storage bucket (private)
- [ ] Add 3 storage policies (SELECT, INSERT, DELETE)
- [ ] Run documents table SQL

Hit me up if you run into any issues! 🦈
