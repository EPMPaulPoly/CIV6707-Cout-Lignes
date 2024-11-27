-- Function to update buffer based on mode footprint
CREATE OR REPLACE FUNCTION transport.update_line_buffer()
RETURNS trigger AS
$$
BEGIN
    -- Get the footprint value from transport_modes and create buffer
    WITH mode_buffer AS (
        SELECT 
            t.id,
            ST_Buffer(
                t.geom,
                m.footprint::numeric,
                'quad_segs=8'
            ) AS buffer_geom
        FROM transport.transit_lines t
        JOIN transport.transit_modes m ON t.mode = m.name
        WHERE t.id = COALESCE(NEW.id, OLD.id)
    )
    UPDATE transport.transit_lines t
    SET buffer = mb.buffer_geom
    FROM mode_buffer mb
    WHERE t.id = mb.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for when footprint changes
DROP TRIGGER IF EXISTS update_buffer_on_mode_change ON transport.transit_modes;
CREATE TRIGGER update_buffer_on_mode_change
    AFTER UPDATE OF footprint
    ON transport.transit_modes
    FOR EACH ROW
    EXECUTE FUNCTION transport.update_line_buffer();

-- Trigger to update buffer when line geometry changes
DROP TRIGGER IF EXISTS update_buffer_on_geom_change ON transport.transit_lines;
CREATE TRIGGER update_buffer_on_geom_change
    AFTER UPDATE OF geom
    ON transport.transit_lines
    FOR EACH ROW
    EXECUTE FUNCTION transport.update_line_buffer();
