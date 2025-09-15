-- Migration: 13_add_usage_type
-- Description: Adds usage_type to schematics and updates search function.

-- 1. Create a helper function to validate the contents of the usage_type array.
CREATE OR REPLACE FUNCTION check_usage_type_values(usage_types TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    utype TEXT;
    valid_types TEXT[] := ARRAY['PvP', 'PvE', 'Meme'];
BEGIN
    -- Allow NULL arrays
    IF usage_types IS NULL THEN
        RETURN TRUE;
    END IF;
    -- Check each element in the input array
    FOREACH utype IN ARRAY usage_types
    LOOP
        IF NOT (utype = ANY(valid_types)) THEN
            RETURN FALSE; -- Found an invalid value
        END IF;
    END LOOP;
    RETURN TRUE; -- All values are valid
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Add the 'usage_type' column to the 'schematics' table as a text array
ALTER TABLE schematics
ADD COLUMN usage_type TEXT[];

-- 3. Add a CHECK constraint using the helper function to ensure data integrity
ALTER TABLE schematics
ADD CONSTRAINT usage_type_valid_values
CHECK (check_usage_type_values(usage_type));

-- 4. Backfill existing schematics with a default usage_type
UPDATE schematics
SET usage_type = ARRAY['PvP']
WHERE usage_type IS NULL;

-- 5. Update the search function to filter by usage_type
CREATE OR REPLACE FUNCTION search_schematics(
    p_search_tokens TEXT[] DEFAULT NULL,
    p_leg_types TEXT[] DEFAULT NULL,
    p_required_part_ids UUID[] DEFAULT NULL,
    p_regulation_family TEXT DEFAULT NULL,
    p_regulation_name TEXT DEFAULT NULL,
    p_usage_types TEXT[] DEFAULT NULL, -- New parameter
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_direction TEXT DEFAULT 'DESC',
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    design_name TEXT,
    designer_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.design_name,
        s.designer_name,
        s.image_url,
        s.created_at,
        COUNT(*) OVER() AS total_count
    FROM
        public.schematics s
    LEFT JOIN
        public.regulations r ON s.regulation_id = r.id
    WHERE
        -- Regulation filter
        (p_regulation_name IS NULL OR r.name = p_regulation_name)
        AND (p_regulation_name IS NOT NULL OR p_regulation_family IS NULL OR r.family = p_regulation_family)

        -- Usage Type filter (uses array overlap '&&' operator)
        AND (p_usage_types IS NULL OR s.usage_type && p_usage_types)

        -- Required parts filter
        AND (p_required_part_ids IS NULL OR array_length(p_required_part_ids, 1) IS NULL OR s.id IN (
            SELECT sp.schematic_id
            FROM public.schematic_parts sp
            WHERE sp.part_id = ANY(p_required_part_ids)
            GROUP BY sp.schematic_id
            HAVING COUNT(DISTINCT sp.part_id) = array_length(p_required_part_ids, 1)
        ))

        -- Leg types filter
        AND (p_leg_types IS NULL OR array_length(p_leg_types, 1) IS NULL OR s.id IN (
            SELECT sp.schematic_id
            FROM public.schematic_parts sp
            JOIN public.parts pa ON sp.part_id = pa.id
            WHERE pa.lookup_category = 'Legs' AND pa.subcategory = ANY(p_leg_types)
        ))

        -- Search tokens filter
        AND (p_search_tokens IS NULL OR array_length(p_search_tokens, 1) IS NULL OR (
            SELECT bool_and(matches)
            FROM (
                SELECT
                    (
                        s.design_name ILIKE '%' || token || '%' OR
                        s.designer_name ILIKE '%' || token || '%' OR
                        EXISTS (
                            SELECT 1
                            FROM public.schematic_parts sp
                            JOIN public.parts pa ON sp.part_id = pa.id
                            WHERE
                                sp.schematic_id = s.id AND
                                (
                                    pa.subcategory ILIKE '%' || token || '%' OR
                                    pa.name ILIKE '%' || token || '%'
                                )
                        )
                    ) AS matches
                FROM unnest(p_search_tokens) AS token
            ) AS token_matches
        ))
    ORDER BY
        CASE WHEN p_sort_by = 'created_at' AND p_sort_direction = 'DESC' THEN s.created_at END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_direction = 'ASC' THEN s.created_at END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'name' AND p_sort_direction = 'DESC' THEN s.design_name END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'name' AND p_sort_direction = 'ASC' THEN s.design_name END ASC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ---
-- End of migration
-- ---