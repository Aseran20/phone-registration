-- Create the coffee_shops table
CREATE TABLE coffee_shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create the phone_registrations table
CREATE TABLE phone_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    coffee_shop_id UUID REFERENCES coffee_shops(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX idx_phone_registrations_coffee_shop ON phone_registrations(coffee_shop_id);
CREATE INDEX idx_phone_registrations_phone_number ON phone_registrations(phone_number);

-- Set up Row Level Security (RLS)
ALTER TABLE coffee_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Coffee shop owners can view their own shop"
    ON coffee_shops FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Coffee shop owners can view their phone registrations"
    ON phone_registrations FOR SELECT
    USING (coffee_shop_id IN (
        SELECT id FROM coffee_shops WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Coffee shop owners can insert phone registrations"
    ON phone_registrations FOR INSERT
    WITH CHECK (coffee_shop_id IN (
        SELECT id FROM coffee_shops WHERE owner_id = auth.uid()
    ));

-- Create function to update last_used_at
CREATE OR REPLACE FUNCTION update_last_used_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_used_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last_used_at
CREATE TRIGGER update_phone_registration_last_used
    BEFORE UPDATE ON phone_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_last_used_at(); 