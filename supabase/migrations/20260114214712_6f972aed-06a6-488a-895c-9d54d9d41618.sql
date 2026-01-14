-- Create guitar_likes table for authenticated likes
CREATE TABLE public.guitar_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id UUID NOT NULL REFERENCES public.guitars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(guitar_id, user_id)
);

-- Create guitar_ownership table for "I have this guitar"
CREATE TABLE public.guitar_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id UUID NOT NULL REFERENCES public.guitars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(guitar_id, user_id)
);

-- Create guitar_comments table
CREATE TABLE public.guitar_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id UUID NOT NULL REFERENCES public.guitars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.guitar_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guitar_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guitar_comments ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Anyone can view likes"
ON public.guitar_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like"
ON public.guitar_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
ON public.guitar_likes FOR DELETE
USING (auth.uid() = user_id);

-- Ownership policies
CREATE POLICY "Anyone can view ownership"
ON public.guitar_ownership FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add ownership"
ON public.guitar_ownership FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own ownership"
ON public.guitar_ownership FOR DELETE
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments"
ON public.guitar_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can comment"
ON public.guitar_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.guitar_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.guitar_comments FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on comments
CREATE TRIGGER update_guitar_comments_updated_at
BEFORE UPDATE ON public.guitar_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();