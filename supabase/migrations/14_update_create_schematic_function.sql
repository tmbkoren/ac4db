-- Migration: 14_update_create_schematic_function
-- Description: Updates the create_schematic_with_details function to include regulation_id and usage_type.

CREATE OR REPLACE FUNCTION create_schematic_with_details(
    p_design_name TEXT,
    p_designer_name TEXT,
    p_user_id UUID,
    p_file_path TEXT,
    p_regulation_id UUID, -- New parameter
    p_usage_type TEXT[], -- New parameter
    p_image_url TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_parts JSONB,
    p_tunings JSONB
)
RETURNS UUID AS $$
DECLARE
    new_schematic_id UUID;
    part_record RECORD;
    master_part_id UUID;
    tuning_key TEXT;
BEGIN
    -- Step 1: Ensure a profile exists for the user.
    INSERT INTO public.profiles (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;

    -- Step 2: Insert the main schematic record with the new fields.
    INSERT INTO schematics (
        design_name,
        designer_name,
        user_id,
        file_path,
        image_url,
        description,
        game,
        regulation_id,
        usage_type
    )
    VALUES (
        p_design_name,
        p_designer_name,
        p_user_id,
        p_file_path,
        p_image_url,
        p_description,
        'ACFA',
        p_regulation_id,
        p_usage_type
    )
    RETURNING id INTO new_schematic_id;

    -- Step 3: Loop through the parts JSON array and insert into the `schematic_parts` join table.
    FOR part_record IN SELECT * FROM jsonb_to_recordset(p_parts) AS x(slot_name TEXT, game_id TEXT, lookup_category TEXT)
    LOOP
        -- Find the master part ID from our 'parts' table using the lookup info.
        SELECT id INTO master_part_id FROM parts
        WHERE parts.game_id = part_record.game_id AND parts.lookup_category = part_record.lookup_category;

        -- Insert the link into the join table.
        IF master_part_id IS NOT NULL THEN
            INSERT INTO schematic_parts (schematic_id, part_id, slot_name)
            VALUES (new_schematic_id, master_part_id, part_record.slot_name);
        END IF;
    END LOOP;

    -- Step 4: Loop through the tunings JSON object and insert into the `schematic_tunings` table.
    FOR tuning_key IN SELECT * FROM jsonb_object_keys(p_tunings)
    LOOP
        INSERT INTO schematic_tunings (schematic_id, tuning_label, tuning_value)
        VALUES (new_schematic_id, tuning_key, (p_tunings->>tuning_key)::INT);
    END LOOP;

    -- Step 5: Return the ID of the newly created schematic.
    RETURN new_schematic_id;
END;
$$ LANGUAGE plpgsql;

-- ---
-- End of migration
-- ---
