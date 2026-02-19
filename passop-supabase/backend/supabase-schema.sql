-- Create passwords table for PassOP application
CREATE TABLE IF NOT EXISTS passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (you may want to restrict this based on your auth strategy)
CREATE POLICY "Enable all operations for passwords" ON passwords
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_passwords_site ON passwords(site);
CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
