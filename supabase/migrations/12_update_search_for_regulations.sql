-- Migration: 12_update_search_for_regulations
-- Description: Updates the search_schematics function to allow filtering by regulation.

CREATE OR REPLACE FUNCTION search_schematics(
    p_search_tokens TEXT[] DEFAULT NULL,
    p_leg_types TEXT[] DEFAULT NULL,
    p_required_part_ids UUID[] DEFAULT NULL,
    p_regulation_family TEXT DEFAULT NULL,
    p_regulation_name TEXT DEFAULT NULL,
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
        -- 1. Filter by regulation name (specific version) if p_regulation_name is provided.
        --    Otherwise, filter by regulation family if p_regulation_family is provided.
        (p_regulation_name IS NULL OR r.name = p_regulation_name)
        AND (p_regulation_name IS NOT NULL OR p_regulation_family IS NULL OR r.family = p_regulation_family)

        -- 2. Filter for schematics that contain ALL of the required parts.
        AND (p_required_part_ids IS NULL OR array_length(p_required_part_ids, 1) IS NULL OR s.id IN (
            SELECT sp.schematic_id
            FROM public.schematic_parts sp
            WHERE sp.part_id = ANY(p_required_part_ids)
            GROUP BY sp.schematic_id
            HAVING COUNT(DISTINCT sp.part_id) = array_length(p_required_part_ids, 1)
        ))

        -- 3. Filter for schematics that use AT LEAST ONE of the specified leg types.
        AND (p_leg_types IS NULL OR array_length(p_leg_types, 1) IS NULL OR s.id IN (
            SELECT sp.schematic_id
            FROM public.schematic_parts sp
            JOIN public.parts pa ON sp.part_id = pa.id
            WHERE pa.lookup_category = 'Legs' AND pa.subcategory = ANY(p_leg_types)
        ))

        -- 4. Filter for schematics that match ALL of the search tokens.
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
