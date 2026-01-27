-- Create business types enum
CREATE TYPE public.business_type AS ENUM ('HOTEL', 'RESTAURANT');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('CASH', 'BANK');

-- Create expense category enum
CREATE TYPE public.expense_category AS ENUM ('FOOD', 'STAFF', 'ELECTRICITY', 'RENT', 'MAINTENANCE', 'OTHER');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL', 'CANCELLED');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type business_type NOT NULL DEFAULT 'RESTAURANT',
    cash_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    bank_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    subscription_status subscription_status NOT NULL DEFAULT 'TRIAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category expense_category NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method payment_method NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method payment_method NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Businesses policies
CREATE POLICY "Users can view their own businesses"
ON public.businesses FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own businesses"
ON public.businesses FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own businesses"
ON public.businesses FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own businesses"
ON public.businesses FOR DELETE
USING (auth.uid() = owner_id);

-- Expenses policies (access through business ownership)
CREATE POLICY "Users can view expenses for their businesses"
ON public.expenses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = expenses.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can create expenses for their businesses"
ON public.expenses FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = expenses.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update expenses for their businesses"
ON public.expenses FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = expenses.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete expenses for their businesses"
ON public.expenses FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = expenses.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

-- Sales policies (access through business ownership)
CREATE POLICY "Users can view sales for their businesses"
ON public.sales FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = sales.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can create sales for their businesses"
ON public.sales FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = sales.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update sales for their businesses"
ON public.sales FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = sales.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete sales for their businesses"
ON public.sales FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = sales.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

-- Function to update balance when expense is added
CREATE OR REPLACE FUNCTION public.update_balance_on_expense()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - NEW.amount WHERE id = NEW.business_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + OLD.amount WHERE id = OLD.business_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + OLD.amount WHERE id = OLD.business_id;
        END IF;
        -- Apply new transaction
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - NEW.amount WHERE id = NEW.business_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update balance when sale is added
CREATE OR REPLACE FUNCTION public.update_balance_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + NEW.amount WHERE id = NEW.business_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - OLD.amount WHERE id = OLD.business_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - OLD.amount WHERE id = OLD.business_id;
        END IF;
        -- Apply new transaction
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + NEW.amount WHERE id = NEW.business_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic balance updates
CREATE TRIGGER expense_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_balance_on_expense();

CREATE TRIGGER sale_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.update_balance_on_sale();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_expenses_business ON public.expenses(business_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_sales_business ON public.sales(business_id);
CREATE INDEX idx_sales_date ON public.sales(date);