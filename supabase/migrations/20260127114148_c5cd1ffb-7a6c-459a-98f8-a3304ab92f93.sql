-- Fix search_path for functions
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
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + OLD.amount WHERE id = OLD.business_id;
        END IF;
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - NEW.amount WHERE id = NEW.business_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
        IF OLD.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance - OLD.amount WHERE id = OLD.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance - OLD.amount WHERE id = OLD.business_id;
        END IF;
        IF NEW.payment_method = 'CASH' THEN
            UPDATE public.businesses SET cash_balance = cash_balance + NEW.amount WHERE id = NEW.business_id;
        ELSE
            UPDATE public.businesses SET bank_balance = bank_balance + NEW.amount WHERE id = NEW.business_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;