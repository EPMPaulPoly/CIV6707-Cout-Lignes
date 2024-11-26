-- Function to rebuild a transit line's geometry from its stops
CREATE OR REPLACE FUNCTION transport.rebuild_transit_line_geometry()
RETURNS trigger AS
$$
BEGIN
    -- Update the line geometry by connecting stops in order and transforming to SRID 3857
    WITH ordered_stops AS (
        SELECT 
            ls.line_id,
            ST_Transform(
                ST_MakeLine(array_agg(ts.geom ORDER BY ls.order_of_stop)),
                3857
            ) AS line_geom
        FROM transport.line_stops ls
        JOIN transport.transit_stops ts ON ls.stop_id = ts.id
        WHERE ls.line_id = COALESCE(NEW.line_id, OLD.line_id)
        GROUP BY ls.line_id
    )
    UPDATE transport.transit_lines t
    SET geom = os.line_geom
    FROM ordered_stops os
    WHERE t.id = os.line_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger for when stops change
DROP TRIGGER IF EXISTS rebuild_line_on_stop_change ON transport.line_stops;
CREATE TRIGGER rebuild_line_on_stop_change
    AFTER INSERT OR UPDATE OR DELETE
    ON transport.line_stops
    FOR EACH ROW
    EXECUTE FUNCTION transport.rebuild_transit_line_geometry();
