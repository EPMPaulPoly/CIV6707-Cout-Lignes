--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2024-11-27 17:51:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 9 (class 2615 OID 30711)
-- Name: cadastre; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA cadastre;


ALTER SCHEMA cadastre OWNER TO postgres;

--
-- TOC entry 8 (class 2615 OID 30468)
-- Name: foncier; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA foncier;


ALTER SCHEMA foncier OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 30435)
-- Name: transport; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA transport;


ALTER SCHEMA transport OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 29351)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5984 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 1020 (class 1255 OID 887865)
-- Name: rebuild_transit_line_geometry(); Type: FUNCTION; Schema: transport; Owner: postgres
--

CREATE FUNCTION transport.rebuild_transit_line_geometry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF TG_TABLE_NAME = 'line_stops' THEN
	    -- Update the line geometry by connecting stops in order and transforming to SRID 3857
	    WITH ordered_stops AS (
	        SELECT 
	            ls.line_id,
	            ST_Transform(
	                ST_MakeLine(array_agg(ts.geom ORDER BY ls.order_of_stop)),
	                3857
	            ) AS line_geom
	        FROM transport.line_stops ls
	        JOIN transport.transit_stops ts ON ls.stop_id = ts.stop_id
	        WHERE ls.line_id = COALESCE(NEW.line_id, OLD.line_id)
	        GROUP BY ls.line_id
	    )
	    UPDATE transport.transit_lines t
	    SET geom = os.line_geom
	    FROM ordered_stops os
	    WHERE t.line_id = os.line_id;
	ELSIF TG_TABLE_NAME = 'transit_stops' THEN
		WITH affected_lines AS (
            SELECT ls.line_id
            FROM transport.line_stops ls
            WHERE ls.stop_id = COALESCE(NEW.stop_id, OLD.stop_id)
        ),
		ordered_stops AS (
			SELECT 
	            ls.line_id,
	            ST_Transform(
	                ST_MakeLine(array_agg(ts.geom ORDER BY ls.order_of_stop)),
	                3857
	            ) AS line_geom
	        FROM transport.line_stops ls
	        JOIN transport.transit_stops ts ON ls.stop_id = ts.stop_id
	        WHERE ls.line_id IN (SELECT line_id FROM affected_lines)
	        GROUP BY ls.line_id
		)
		UPDATE transport.transit_lines t
	    SET geom = os.line_geom
	    FROM ordered_stops os
	    WHERE t.line_id = os.line_id;
	END IF;	
    RETURN NEW;
END;
$$;


ALTER FUNCTION transport.rebuild_transit_line_geometry() OWNER TO postgres;

--
-- TOC entry 306 (class 1255 OID 887868)
-- Name: update_line_buffer(); Type: FUNCTION; Schema: transport; Owner: postgres
--

CREATE FUNCTION transport.update_line_buffer() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_TABLE_NAME = 'transit_lines' THEN
        -- Trigger is on transit_lines
        WITH mode_buffer AS (
            SELECT 
                t.line_id,
                ST_Buffer(
                    t.geom,
                    m.footprint::numeric,
                    'quad_segs=8'
                ) AS buffer_geom
            FROM transport.transit_lines t
            JOIN transport.transit_modes m ON t.mode_id = m.mode_id
            WHERE t.line_id = COALESCE(NEW.line_id, OLD.line_id)
        )
        UPDATE transport.transit_lines t
        SET buffer_geom = mb.buffer_geom
        FROM mode_buffer mb
        WHERE t.line_id = mb.line_id;

    ELSIF TG_TABLE_NAME = 'transit_modes' THEN
        -- Trigger is on transit_modes
        WITH affected_lines AS (
            SELECT t.line_id
            FROM transport.transit_lines t
            WHERE t.mode_id = COALESCE(NEW.mode_id, OLD.mode_id)
        ),
        mode_buffer AS (
            SELECT 
                t.line_id,
                ST_Buffer(
                    t.geom,
                    m.footprint::numeric,
                    'quad_segs=8'
                ) AS buffer_geom
            FROM transport.transit_lines t
            JOIN transport.transit_modes m ON t.mode_id = m.mode_id
            WHERE t.line_id IN (SELECT line_id FROM affected_lines)
        )
        UPDATE transport.transit_lines t
        SET buffer_geom = mb.buffer_geom
        FROM mode_buffer mb
        WHERE t.line_id = mb.line_id;
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION transport.update_line_buffer() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 257 (class 1259 OID 30712)
-- Name: cadastre_montreal; Type: TABLE; Schema: cadastre; Owner: postgres
--

CREATE TABLE cadastre.cadastre_montreal (
    ogc_fid integer NOT NULL,
    wkb_geometry public.geometry(Geometry,3857),
    objectid numeric(11,0),
    no_lot character varying(10),
    co_type_po character varying(2),
    co_type_di character varying(1),
    co_echel_c character varying(5),
    co_echel_r character varying(5),
    co_echel00 character varying(5),
    nb_coord_x numeric(31,15),
    nb_coord_y numeric(31,15),
    nb_angle_n numeric(31,15),
    co_indic_f character varying(1),
    va_suprf_l numeric(31,15),
    va_suprf00 numeric(31,15),
    co_type_un character varying(1),
    no_plan_co character varying(8),
    co_circn_f character varying(3),
    nm_circn_f character varying(30),
    da_depot_c character varying(21),
    no_feuil_c character varying(12),
    da_mise_vi character varying(21),
    dh_dernr_m character varying(21),
    shape_leng numeric(31,15),
    shape_area numeric(31,15),
    dat_acqui character varying(21),
    dat_charg character varying(21),
    oid_ numeric(11,0)
);


ALTER TABLE cadastre.cadastre_montreal OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 30717)
-- Name: cadastre montreal_ogc_fid_seq; Type: SEQUENCE; Schema: cadastre; Owner: postgres
--

CREATE SEQUENCE cadastre."cadastre montreal_ogc_fid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE cadastre."cadastre montreal_ogc_fid_seq" OWNER TO postgres;

--
-- TOC entry 5985 (class 0 OID 0)
-- Dependencies: 258
-- Name: cadastre montreal_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: cadastre; Owner: postgres
--

ALTER SEQUENCE cadastre."cadastre montreal_ogc_fid_seq" OWNED BY cadastre.cadastre_montreal.ogc_fid;


--
-- TOC entry 259 (class 1259 OID 36633)
-- Name: cadastre_quebec; Type: TABLE; Schema: cadastre; Owner: postgres
--

CREATE TABLE cadastre.cadastre_quebec (
    ogc_fid integer NOT NULL,
    wkb_geometry public.geometry(MultiPolygon,3857),
    objectid numeric(11,0),
    no_lot character varying(10),
    co_type_po character varying(2),
    co_type_di character varying(1),
    co_echel_c character varying(5),
    co_echel_r character varying(5),
    co_echel00 character varying(5),
    nb_coord_x numeric(31,15),
    nb_coord_y numeric(31,15),
    nb_angle_n numeric(31,15),
    co_indic_f character varying(1),
    va_suprf_l numeric(31,15),
    va_suprf00 numeric(31,15),
    co_type_un character varying(1),
    no_plan_co character varying(8),
    co_circn_f character varying(3),
    nm_circn_f character varying(30),
    da_depot_c character varying(21),
    no_feuil_c character varying(12),
    da_mise_vi character varying(21),
    dh_dernr_m character varying(21),
    shape_leng numeric(31,15),
    shape_area numeric(31,15),
    dat_acqui character varying(21),
    dat_charg character varying(21),
    oid_ numeric(11,0),
    layer character varying(254),
    path character varying(254)
);


ALTER TABLE cadastre.cadastre_quebec OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 36636)
-- Name: cadastre quÃ©bec_ogc_fid_seq; Type: SEQUENCE; Schema: cadastre; Owner: postgres
--

CREATE SEQUENCE cadastre."cadastre quÃ©bec_ogc_fid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE cadastre."cadastre quÃ©bec_ogc_fid_seq" OWNER TO postgres;

--
-- TOC entry 5986 (class 0 OID 0)
-- Dependencies: 260
-- Name: cadastre quÃ©bec_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: cadastre; Owner: postgres
--

ALTER SEQUENCE cadastre."cadastre quÃ©bec_ogc_fid_seq" OWNED BY cadastre.cadastre_quebec.ogc_fid;


--
-- TOC entry 237 (class 1259 OID 30515)
-- Name: b05ex1_b05v_adr_unite_evaln; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.b05ex1_b05v_adr_unite_evaln (
    objectid integer NOT NULL,
    anrole character varying(4),
    id_provinc character varying(23),
    code_mun character varying(5),
    rl0102a character varying(5),
    mat18 character varying(18),
    no_seq_adr character varying(2),
    rl0101a character varying(6),
    rl0101b character varying(4),
    rl0101c character varying(6),
    rl0101d character varying(4),
    rl0101e character varying(2),
    rl0101f character varying(1),
    rl0101g character varying(60),
    rl0101h character varying(2),
    rl0101i character varying(5),
    rl0101j character varying(5)
);


ALTER TABLE foncier.b05ex1_b05v_adr_unite_evaln OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 30518)
-- Name: b05ex1_b05v_adr_unite_evaln_objectid_seq; Type: SEQUENCE; Schema: foncier; Owner: postgres
--

CREATE SEQUENCE foncier.b05ex1_b05v_adr_unite_evaln_objectid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE foncier.b05ex1_b05v_adr_unite_evaln_objectid_seq OWNER TO postgres;

--
-- TOC entry 5987 (class 0 OID 0)
-- Dependencies: 238
-- Name: b05ex1_b05v_adr_unite_evaln_objectid_seq; Type: SEQUENCE OWNED BY; Schema: foncier; Owner: postgres
--

ALTER SEQUENCE foncier.b05ex1_b05v_adr_unite_evaln_objectid_seq OWNED BY foncier.b05ex1_b05v_adr_unite_evaln.objectid;


--
-- TOC entry 239 (class 1259 OID 30519)
-- Name: b05ex1_b05v_repar_fisc; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.b05ex1_b05v_repar_fisc (
    objectid integer NOT NULL,
    anrole character varying(4),
    id_provinc character varying(23),
    code_mun character varying(5),
    rl0102a character varying(5),
    mat18 character varying(18),
    rl0504a character varying(8),
    rl0504b character varying(12),
    rl0504c character varying(10),
    rl0504d double precision,
    rl0504e character varying(1),
    rl0504f character varying(1),
    rl0506a character varying(3),
    rl0506b integer,
    rl0507a character varying(8),
    rl0507b character varying(10),
    rl0507c character varying(4),
    rl0507d double precision,
    rl0507e character varying(1),
    rl0507f character varying(1)
);


ALTER TABLE foncier.b05ex1_b05v_repar_fisc OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 30522)
-- Name: b05ex1_b05v_repar_fisc_objectid_seq; Type: SEQUENCE; Schema: foncier; Owner: postgres
--

CREATE SEQUENCE foncier.b05ex1_b05v_repar_fisc_objectid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE foncier.b05ex1_b05v_repar_fisc_objectid_seq OWNER TO postgres;

--
-- TOC entry 5988 (class 0 OID 0)
-- Dependencies: 240
-- Name: b05ex1_b05v_repar_fisc_objectid_seq; Type: SEQUENCE OWNED BY; Schema: foncier; Owner: postgres
--

ALTER SEQUENCE foncier.b05ex1_b05v_repar_fisc_objectid_seq OWNED BY foncier.b05ex1_b05v_repar_fisc.objectid;


--
-- TOC entry 241 (class 1259 OID 30523)
-- Name: b05ex1_b05v_unite_evaln; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.b05ex1_b05v_unite_evaln (
    objectid integer NOT NULL,
    anrole character varying(4),
    id_provinc character varying(23),
    code_mun character varying(5),
    rl0102a character varying(5),
    mat18 character varying(18),
    rl0104g character varying(2),
    rl0104h character varying(2),
    rl0105a character varying(4),
    rl0106a character varying(15),
    rl0107a character varying(4),
    rl0301a double precision,
    rl0302a double precision,
    rl0303a character varying(1),
    rl0304a double precision,
    rl0305a double precision,
    rl0306a integer,
    rl0307a character varying(4),
    rl0307b character varying(1),
    rl0308a double precision,
    rl0309a character varying(1),
    rl0311a integer,
    rl0312a integer,
    rl0313a smallint,
    rl0402a integer,
    rl0403a integer,
    rl0404a integer,
    rl0405a integer,
    rl0501a character varying(1),
    rl0502a character varying(2),
    rl0503a character varying(1),
    rl0505a integer,
    ind_nouv_ctrid character varying(3),
    dat_cond_mrche timestamp with time zone,
    rl0310a character varying(1),
    rl0314a double precision,
    rl0315a double precision,
    rl0316a double precision
);


ALTER TABLE foncier.b05ex1_b05v_unite_evaln OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 30526)
-- Name: b05ex1_b05v_unite_evaln_objectid_seq; Type: SEQUENCE; Schema: foncier; Owner: postgres
--

CREATE SEQUENCE foncier.b05ex1_b05v_unite_evaln_objectid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE foncier.b05ex1_b05v_unite_evaln_objectid_seq OWNER TO postgres;

--
-- TOC entry 5989 (class 0 OID 0)
-- Dependencies: 242
-- Name: b05ex1_b05v_unite_evaln_objectid_seq; Type: SEQUENCE OWNED BY; Schema: foncier; Owner: postgres
--

ALTER SEQUENCE foncier.b05ex1_b05v_unite_evaln_objectid_seq OWNED BY foncier.b05ex1_b05v_unite_evaln.objectid;


--
-- TOC entry 243 (class 1259 OID 30532)
-- Name: code_cl_imm_n_resd; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_cl_imm_n_resd (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_cl_imm_n_resd OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 30537)
-- Name: code_cl_industrielle; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_cl_industrielle (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_cl_industrielle OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 30475)
-- Name: code_generique_adresse; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_generique_adresse (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_generique_adresse OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 30542)
-- Name: code_inscription; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_inscription (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_inscription OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 30480)
-- Name: code_lien_adresse; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_lien_adresse (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_lien_adresse OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 30547)
-- Name: code_lien_physique; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_lien_physique (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_lien_physique OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 30485)
-- Name: code_orientation_adresse; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_orientation_adresse (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_orientation_adresse OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 30552)
-- Name: code_partie_immeuble; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_partie_immeuble (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_partie_immeuble OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 30557)
-- Name: code_statut; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_statut (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_statut OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 30562)
-- Name: code_terrain_vague; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_terrain_vague (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_terrain_vague OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 30567)
-- Name: code_utilisation; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_utilisation (
    code smallint NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_utilisation OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 30572)
-- Name: code_zonage_agricole; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.code_zonage_agricole (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.code_zonage_agricole OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 30577)
-- Name: dom_rejet; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.dom_rejet (
    code character varying NOT NULL,
    descriptio character varying
);


ALTER TABLE foncier.dom_rejet OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 30592)
-- Name: rol_unite_p; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.rol_unite_p (
    objectid integer NOT NULL,
    id_provinc character varying(23),
    code_mun character varying(5),
    arrond character varying(5),
    rejet integer,
    date_entree character varying(4),
    mat18 character varying(18),
    shape public.geometry(Point,4326)
);


ALTER TABLE foncier.rol_unite_p OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 30597)
-- Name: rol_unite_p_objectid_seq; Type: SEQUENCE; Schema: foncier; Owner: postgres
--

CREATE SEQUENCE foncier.rol_unite_p_objectid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE foncier.rol_unite_p_objectid_seq OWNER TO postgres;

--
-- TOC entry 5990 (class 0 OID 0)
-- Dependencies: 254
-- Name: rol_unite_p_objectid_seq; Type: SEQUENCE OWNED BY; Schema: foncier; Owner: postgres
--

ALTER SEQUENCE foncier.rol_unite_p_objectid_seq OWNED BY foncier.rol_unite_p.objectid;


--
-- TOC entry 232 (class 1259 OID 30470)
-- Name: role_foncier; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.role_foncier (
    id_provinc character varying(23) NOT NULL,
    geog public.geometry(Point,3857),
    is_new boolean,
    date_entree smallint,
    anrole smallint,
    code_utilisation smallint,
    code_mun character varying(5),
    land_width_m numeric(8,2),
    land_area_sq_m numeric(15,2),
    building_levels smallint,
    building_start_date smallint,
    building_start_date_is_estimated boolean,
    building_levels_area_sq_m numeric(8,1),
    code_lien_physique smallint,
    building_flats smallint,
    building_rental_rooms smallint,
    building_non_flats_spaces smallint,
    value_land bigint,
    value_building bigint,
    value_total bigint,
    geog_changed_entrance_aligned boolean,
    geog_changed_entrance_aligned_distance_m bigint,
    value_changed boolean,
    postal_code character varying(12),
    non_contiguous_addresses boolean,
    addresses character varying[],
    addresses_text character varying,
    code_utilisation_description character varying,
    count_addresses integer,
    mat18_building_id bigint,
    mat18_local_id integer,
    count_locals_in_building integer,
    count_flats_in_building integer,
    geog_approximate boolean,
    addresses_count integer,
    is_in_od_montreal boolean,
    is_ignored boolean
);


ALTER TABLE foncier.role_foncier OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 30490)
-- Name: role_foncier_adresses; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.role_foncier_adresses (
    id integer NOT NULL,
    id_provinc character varying(23) NOT NULL,
    code_mun character varying(5),
    postal_code character varying(12),
    address_civic_number_start integer,
    address_civic_letter_start character varying(4),
    address_civic_number_end integer,
    address_civic_letter_end character varying(4),
    code_generique_adresse character varying(2),
    code_lien_adresse character varying(1),
    address_street_name character varying(255),
    code_orientation_adresse character varying(2),
    address_app_number character varying(5),
    address_complement character varying(5),
    value_changed boolean
);


ALTER TABLE foncier.role_foncier_adresses OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 30598)
-- Name: role_foncier_adresses_id_seq; Type: SEQUENCE; Schema: foncier; Owner: postgres
--

CREATE SEQUENCE foncier.role_foncier_adresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE foncier.role_foncier_adresses_id_seq OWNER TO postgres;

--
-- TOC entry 5991 (class 0 OID 0)
-- Dependencies: 255
-- Name: role_foncier_adresses_id_seq; Type: SEQUENCE OWNED BY; Schema: foncier; Owner: postgres
--

ALTER SEQUENCE foncier.role_foncier_adresses_id_seq OWNED BY foncier.role_foncier_adresses.id;


--
-- TOC entry 256 (class 1259 OID 30599)
-- Name: role_foncier_original; Type: TABLE; Schema: foncier; Owner: postgres
--

CREATE TABLE foncier.role_foncier_original (
    id_provinc character varying(23) NOT NULL,
    geog public.geography(Point,4326)
);


ALTER TABLE foncier.role_foncier_original OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 30437)
-- Name: line_stops; Type: TABLE; Schema: transport; Owner: postgres
--

CREATE TABLE transport.line_stops (
    assoc_id integer NOT NULL,
    line_id integer,
    stop_id integer,
    order_of_stop integer
);


ALTER TABLE transport.line_stops OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 30436)
-- Name: line_stops_assoc_id_seq; Type: SEQUENCE; Schema: transport; Owner: postgres
--

CREATE SEQUENCE transport.line_stops_assoc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE transport.line_stops_assoc_id_seq OWNER TO postgres;

--
-- TOC entry 5992 (class 0 OID 0)
-- Dependencies: 224
-- Name: line_stops_assoc_id_seq; Type: SEQUENCE OWNED BY; Schema: transport; Owner: postgres
--

ALTER SEQUENCE transport.line_stops_assoc_id_seq OWNED BY transport.line_stops.assoc_id;


--
-- TOC entry 261 (class 1259 OID 887881)
-- Name: lot_point_relationship; Type: TABLE; Schema: transport; Owner: postgres
--

CREATE TABLE transport.lot_point_relationship (
    lot_id integer,
    role_foncier_id character varying(23)
);


ALTER TABLE transport.lot_point_relationship OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 30444)
-- Name: transit_lines; Type: TABLE; Schema: transport; Owner: postgres
--

CREATE TABLE transport.transit_lines (
    line_id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    mode_id integer,
    color character varying(255),
    geom public.geometry(LineString,3857),
    buffer_geom public.geometry(Polygon,3857)
);


ALTER TABLE transport.transit_lines OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 30443)
-- Name: transit_lines_line_id_seq; Type: SEQUENCE; Schema: transport; Owner: postgres
--

CREATE SEQUENCE transport.transit_lines_line_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE transport.transit_lines_line_id_seq OWNER TO postgres;

--
-- TOC entry 5993 (class 0 OID 0)
-- Dependencies: 226
-- Name: transit_lines_line_id_seq; Type: SEQUENCE OWNED BY; Schema: transport; Owner: postgres
--

ALTER SEQUENCE transport.transit_lines_line_id_seq OWNED BY transport.transit_lines.line_id;


--
-- TOC entry 231 (class 1259 OID 30460)
-- Name: transit_modes; Type: TABLE; Schema: transport; Owner: postgres
--

CREATE TABLE transport.transit_modes (
    mode_id integer NOT NULL,
    name character varying(255),
    cost_per_km double precision,
    cost_per_station double precision,
    footprint double precision
);


ALTER TABLE transport.transit_modes OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 30459)
-- Name: transit_modes_mode_id_seq; Type: SEQUENCE; Schema: transport; Owner: postgres
--

CREATE SEQUENCE transport.transit_modes_mode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE transport.transit_modes_mode_id_seq OWNER TO postgres;

--
-- TOC entry 5994 (class 0 OID 0)
-- Dependencies: 230
-- Name: transit_modes_mode_id_seq; Type: SEQUENCE OWNED BY; Schema: transport; Owner: postgres
--

ALTER SEQUENCE transport.transit_modes_mode_id_seq OWNED BY transport.transit_modes.mode_id;


--
-- TOC entry 229 (class 1259 OID 30451)
-- Name: transit_stops; Type: TABLE; Schema: transport; Owner: postgres
--

CREATE TABLE transport.transit_stops (
    stop_id integer NOT NULL,
    name character varying(255),
    is_station boolean,
    geom public.geometry(Point,3857)
);


ALTER TABLE transport.transit_stops OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 30450)
-- Name: transit_stops_stop_id_seq; Type: SEQUENCE; Schema: transport; Owner: postgres
--

CREATE SEQUENCE transport.transit_stops_stop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE transport.transit_stops_stop_id_seq OWNER TO postgres;

--
-- TOC entry 5995 (class 0 OID 0)
-- Dependencies: 228
-- Name: transit_stops_stop_id_seq; Type: SEQUENCE OWNED BY; Schema: transport; Owner: postgres
--

ALTER SEQUENCE transport.transit_stops_stop_id_seq OWNED BY transport.transit_stops.stop_id;


--
-- TOC entry 5740 (class 2604 OID 30718)
-- Name: cadastre_montreal ogc_fid; Type: DEFAULT; Schema: cadastre; Owner: postgres
--

ALTER TABLE ONLY cadastre.cadastre_montreal ALTER COLUMN ogc_fid SET DEFAULT nextval('cadastre."cadastre montreal_ogc_fid_seq"'::regclass);


--
-- TOC entry 5741 (class 2604 OID 36637)
-- Name: cadastre_quebec ogc_fid; Type: DEFAULT; Schema: cadastre; Owner: postgres
--

ALTER TABLE ONLY cadastre.cadastre_quebec ALTER COLUMN ogc_fid SET DEFAULT nextval('cadastre."cadastre quÃ©bec_ogc_fid_seq"'::regclass);


--
-- TOC entry 5736 (class 2604 OID 30604)
-- Name: b05ex1_b05v_adr_unite_evaln objectid; Type: DEFAULT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_adr_unite_evaln ALTER COLUMN objectid SET DEFAULT nextval('foncier.b05ex1_b05v_adr_unite_evaln_objectid_seq'::regclass);


--
-- TOC entry 5737 (class 2604 OID 30605)
-- Name: b05ex1_b05v_repar_fisc objectid; Type: DEFAULT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_repar_fisc ALTER COLUMN objectid SET DEFAULT nextval('foncier.b05ex1_b05v_repar_fisc_objectid_seq'::regclass);


--
-- TOC entry 5738 (class 2604 OID 30606)
-- Name: b05ex1_b05v_unite_evaln objectid; Type: DEFAULT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_unite_evaln ALTER COLUMN objectid SET DEFAULT nextval('foncier.b05ex1_b05v_unite_evaln_objectid_seq'::regclass);


--
-- TOC entry 5739 (class 2604 OID 30607)
-- Name: rol_unite_p objectid; Type: DEFAULT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.rol_unite_p ALTER COLUMN objectid SET DEFAULT nextval('foncier.rol_unite_p_objectid_seq'::regclass);


--
-- TOC entry 5735 (class 2604 OID 30608)
-- Name: role_foncier_adresses id; Type: DEFAULT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_adresses ALTER COLUMN id SET DEFAULT nextval('foncier.role_foncier_adresses_id_seq'::regclass);


--
-- TOC entry 5731 (class 2604 OID 30440)
-- Name: line_stops assoc_id; Type: DEFAULT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.line_stops ALTER COLUMN assoc_id SET DEFAULT nextval('transport.line_stops_assoc_id_seq'::regclass);


--
-- TOC entry 5732 (class 2604 OID 30447)
-- Name: transit_lines line_id; Type: DEFAULT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_lines ALTER COLUMN line_id SET DEFAULT nextval('transport.transit_lines_line_id_seq'::regclass);


--
-- TOC entry 5734 (class 2604 OID 30463)
-- Name: transit_modes mode_id; Type: DEFAULT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_modes ALTER COLUMN mode_id SET DEFAULT nextval('transport.transit_modes_mode_id_seq'::regclass);


--
-- TOC entry 5733 (class 2604 OID 30454)
-- Name: transit_stops stop_id; Type: DEFAULT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_stops ALTER COLUMN stop_id SET DEFAULT nextval('transport.transit_stops_stop_id_seq'::regclass);


--
-- TOC entry 5810 (class 2606 OID 34100)
-- Name: cadastre_montreal cadastre montreal_pk; Type: CONSTRAINT; Schema: cadastre; Owner: postgres
--

ALTER TABLE ONLY cadastre.cadastre_montreal
    ADD CONSTRAINT "cadastre montreal_pk" PRIMARY KEY (ogc_fid);


--
-- TOC entry 5815 (class 2606 OID 36639)
-- Name: cadastre_quebec cadastre quÃ©bec_pk; Type: CONSTRAINT; Schema: cadastre; Owner: postgres
--

ALTER TABLE ONLY cadastre.cadastre_quebec
    ADD CONSTRAINT "cadastre quÃ©bec_pk" PRIMARY KEY (ogc_fid);


--
-- TOC entry 5777 (class 2606 OID 30610)
-- Name: b05ex1_b05v_adr_unite_evaln b05ex1_b05v_adr_unite_evaln_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_adr_unite_evaln
    ADD CONSTRAINT b05ex1_b05v_adr_unite_evaln_pkey PRIMARY KEY (objectid);


--
-- TOC entry 5779 (class 2606 OID 30612)
-- Name: b05ex1_b05v_repar_fisc b05ex1_b05v_repar_fisc_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_repar_fisc
    ADD CONSTRAINT b05ex1_b05v_repar_fisc_pkey PRIMARY KEY (objectid);


--
-- TOC entry 5781 (class 2606 OID 30615)
-- Name: b05ex1_b05v_unite_evaln b05ex1_b05v_unite_evaln_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.b05ex1_b05v_unite_evaln
    ADD CONSTRAINT b05ex1_b05v_unite_evaln_pkey PRIMARY KEY (objectid);


--
-- TOC entry 5784 (class 2606 OID 30617)
-- Name: code_cl_imm_n_resd code_cl_imm_n_resd_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_cl_imm_n_resd
    ADD CONSTRAINT code_cl_imm_n_resd_pkey PRIMARY KEY (code);


--
-- TOC entry 5786 (class 2606 OID 30619)
-- Name: code_cl_industrielle code_cl_industrielle_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_cl_industrielle
    ADD CONSTRAINT code_cl_industrielle_pkey PRIMARY KEY (code);


--
-- TOC entry 5767 (class 2606 OID 30621)
-- Name: code_generique_adresse code_generique_adresse_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_generique_adresse
    ADD CONSTRAINT code_generique_adresse_pkey PRIMARY KEY (code);


--
-- TOC entry 5788 (class 2606 OID 30623)
-- Name: code_inscription code_inscription_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_inscription
    ADD CONSTRAINT code_inscription_pkey PRIMARY KEY (code);


--
-- TOC entry 5769 (class 2606 OID 30625)
-- Name: code_lien_adresse code_lien_adresse_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_lien_adresse
    ADD CONSTRAINT code_lien_adresse_pkey PRIMARY KEY (code);


--
-- TOC entry 5790 (class 2606 OID 30627)
-- Name: code_lien_physique code_lien_physique_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_lien_physique
    ADD CONSTRAINT code_lien_physique_pkey PRIMARY KEY (code);


--
-- TOC entry 5771 (class 2606 OID 30629)
-- Name: code_orientation_adresse code_orientation_adresse_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_orientation_adresse
    ADD CONSTRAINT code_orientation_adresse_pkey PRIMARY KEY (code);


--
-- TOC entry 5792 (class 2606 OID 30631)
-- Name: code_partie_immeuble code_partie_immeuble_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_partie_immeuble
    ADD CONSTRAINT code_partie_immeuble_pkey PRIMARY KEY (code);


--
-- TOC entry 5794 (class 2606 OID 30633)
-- Name: code_statut code_statut_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_statut
    ADD CONSTRAINT code_statut_pkey PRIMARY KEY (code);


--
-- TOC entry 5796 (class 2606 OID 30635)
-- Name: code_terrain_vague code_terrain_vague_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_terrain_vague
    ADD CONSTRAINT code_terrain_vague_pkey PRIMARY KEY (code);


--
-- TOC entry 5798 (class 2606 OID 30637)
-- Name: code_utilisation code_utilisation_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_utilisation
    ADD CONSTRAINT code_utilisation_pkey PRIMARY KEY (code);


--
-- TOC entry 5800 (class 2606 OID 30639)
-- Name: code_zonage_agricole code_zonage_agricole_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.code_zonage_agricole
    ADD CONSTRAINT code_zonage_agricole_pkey PRIMARY KEY (code);


--
-- TOC entry 5802 (class 2606 OID 30641)
-- Name: dom_rejet dom_rejet_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.dom_rejet
    ADD CONSTRAINT dom_rejet_pkey PRIMARY KEY (code);


--
-- TOC entry 5805 (class 2606 OID 30643)
-- Name: rol_unite_p rol_unite_p_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.rol_unite_p
    ADD CONSTRAINT rol_unite_p_pkey PRIMARY KEY (objectid);


--
-- TOC entry 5774 (class 2606 OID 30645)
-- Name: role_foncier_adresses role_foncier_adresses_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_adresses
    ADD CONSTRAINT role_foncier_adresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5808 (class 2606 OID 30647)
-- Name: role_foncier_original role_foncier_original_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_original
    ADD CONSTRAINT role_foncier_original_pkey PRIMARY KEY (id_provinc);


--
-- TOC entry 5765 (class 2606 OID 30649)
-- Name: role_foncier role_foncier_pkey; Type: CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier
    ADD CONSTRAINT role_foncier_pkey PRIMARY KEY (id_provinc);


--
-- TOC entry 5746 (class 2606 OID 30442)
-- Name: line_stops line_stops_pkey; Type: CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.line_stops
    ADD CONSTRAINT line_stops_pkey PRIMARY KEY (assoc_id);


--
-- TOC entry 5748 (class 2606 OID 30458)
-- Name: transit_lines transit_lines_pkey; Type: CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_lines
    ADD CONSTRAINT transit_lines_pkey PRIMARY KEY (line_id);


--
-- TOC entry 5752 (class 2606 OID 30465)
-- Name: transit_modes transit_modes_pkey; Type: CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_modes
    ADD CONSTRAINT transit_modes_pkey PRIMARY KEY (mode_id);


--
-- TOC entry 5750 (class 2606 OID 30456)
-- Name: transit_stops transit_stops_pkey; Type: CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_stops
    ADD CONSTRAINT transit_stops_pkey PRIMARY KEY (stop_id);


--
-- TOC entry 5811 (class 1259 OID 34101)
-- Name: cadastre montreal_wkb_geometry_geom_idx; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX "cadastre montreal_wkb_geometry_geom_idx" ON cadastre.cadastre_montreal USING gist (wkb_geometry);


--
-- TOC entry 5816 (class 1259 OID 887839)
-- Name: cadastre quÃ©bec_wkb_geometry_geom_idx; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX "cadastre quÃ©bec_wkb_geometry_geom_idx" ON cadastre.cadastre_quebec USING gist (wkb_geometry);


--
-- TOC entry 5817 (class 1259 OID 887879)
-- Name: cadastre_quebec_wkb_geometry_idx; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX cadastre_quebec_wkb_geometry_idx ON cadastre.cadastre_quebec USING gist (wkb_geometry);


--
-- TOC entry 5812 (class 1259 OID 34102)
-- Name: idx_cadastre_montreal_geom; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX idx_cadastre_montreal_geom ON cadastre.cadastre_montreal USING gist (wkb_geometry);


--
-- TOC entry 5813 (class 1259 OID 34103)
-- Name: idx_cadastre_montreal_wkb_geom; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX idx_cadastre_montreal_wkb_geom ON cadastre.cadastre_montreal USING gist (wkb_geometry);


--
-- TOC entry 5818 (class 1259 OID 887845)
-- Name: idx_cadastre_quebec_geom; Type: INDEX; Schema: cadastre; Owner: postgres
--

CREATE INDEX idx_cadastre_quebec_geom ON cadastre.cadastre_quebec USING gist (wkb_geometry);


--
-- TOC entry 5775 (class 1259 OID 30650)
-- Name: a_id_provinc; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX a_id_provinc ON foncier.b05ex1_b05v_adr_unite_evaln USING btree (id_provinc);


--
-- TOC entry 5782 (class 1259 OID 30651)
-- Name: e_id_provinc; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX e_id_provinc ON foncier.b05ex1_b05v_unite_evaln USING btree (id_provinc);


--
-- TOC entry 5753 (class 1259 OID 887844)
-- Name: idx_role_foncier_geom; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX idx_role_foncier_geom ON foncier.role_foncier USING gist (geog);


--
-- TOC entry 5754 (class 1259 OID 36600)
-- Name: r_geog; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX r_geog ON foncier.role_foncier USING gist (geog);


--
-- TOC entry 5755 (class 1259 OID 30653)
-- Name: r_geog_changed_entrance_aligned; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX r_geog_changed_entrance_aligned ON foncier.role_foncier USING btree (geog_changed_entrance_aligned);


--
-- TOC entry 5756 (class 1259 OID 36601)
-- Name: r_geog_original; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX r_geog_original ON foncier.role_foncier USING gist (geog);


--
-- TOC entry 5757 (class 1259 OID 30658)
-- Name: r_id_provinc; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX r_id_provinc ON foncier.role_foncier USING btree (id_provinc);


--
-- TOC entry 5758 (class 1259 OID 30659)
-- Name: r_mat18_building_id; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX r_mat18_building_id ON foncier.role_foncier USING btree (mat18_building_id);


--
-- TOC entry 5772 (class 1259 OID 30660)
-- Name: rfa_id_provinc; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX rfa_id_provinc ON foncier.role_foncier_adresses USING btree (id_provinc);


--
-- TOC entry 5803 (class 1259 OID 30661)
-- Name: rol_unite_p_id_provinc; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX rol_unite_p_id_provinc ON foncier.rol_unite_p USING btree (id_provinc);


--
-- TOC entry 5806 (class 1259 OID 30662)
-- Name: rol_unite_p_shape_geom_idx; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX rol_unite_p_shape_geom_idx ON foncier.rol_unite_p USING gist (shape);


--
-- TOC entry 5759 (class 1259 OID 30663)
-- Name: role_foncier_code; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX role_foncier_code ON foncier.role_foncier USING btree (code_utilisation);


--
-- TOC entry 5760 (class 1259 OID 30664)
-- Name: role_foncier_code_mun_idx; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX role_foncier_code_mun_idx ON foncier.role_foncier USING btree (code_mun);


--
-- TOC entry 5761 (class 1259 OID 887880)
-- Name: role_foncier_geog_idx; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX role_foncier_geog_idx ON foncier.role_foncier USING gist (geog);


--
-- TOC entry 5762 (class 1259 OID 30665)
-- Name: role_foncier_is_ignored_idx; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX role_foncier_is_ignored_idx ON foncier.role_foncier USING btree (is_ignored);


--
-- TOC entry 5763 (class 1259 OID 30666)
-- Name: role_foncier_is_in_od_montreal_idx; Type: INDEX; Schema: foncier; Owner: postgres
--

CREATE INDEX role_foncier_is_in_od_montreal_idx ON foncier.role_foncier USING btree (is_in_od_montreal);


--
-- TOC entry 5826 (class 2620 OID 887866)
-- Name: line_stops rebuild_line_on_stop_change; Type: TRIGGER; Schema: transport; Owner: postgres
--

CREATE TRIGGER rebuild_line_on_stop_change AFTER INSERT OR DELETE OR UPDATE ON transport.line_stops FOR EACH ROW EXECUTE FUNCTION transport.rebuild_transit_line_geometry();


--
-- TOC entry 5830 (class 2620 OID 887878)
-- Name: transit_modes update_buffer_on_footprint_change; Type: TRIGGER; Schema: transport; Owner: postgres
--

CREATE TRIGGER update_buffer_on_footprint_change BEFORE INSERT OR UPDATE OF footprint ON transport.transit_modes FOR EACH ROW EXECUTE FUNCTION transport.update_line_buffer();


--
-- TOC entry 5827 (class 2620 OID 887870)
-- Name: transit_lines update_buffer_on_geom_change; Type: TRIGGER; Schema: transport; Owner: postgres
--

CREATE TRIGGER update_buffer_on_geom_change AFTER UPDATE OF geom ON transport.transit_lines FOR EACH ROW EXECUTE FUNCTION transport.update_line_buffer();


--
-- TOC entry 5828 (class 2620 OID 887877)
-- Name: transit_lines update_buffer_on_mode_change; Type: TRIGGER; Schema: transport; Owner: postgres
--

CREATE TRIGGER update_buffer_on_mode_change AFTER INSERT OR UPDATE OF mode_id ON transport.transit_lines FOR EACH ROW EXECUTE FUNCTION transport.update_line_buffer();


--
-- TOC entry 5829 (class 2620 OID 887874)
-- Name: transit_stops update_line_geoms_on_stop_change; Type: TRIGGER; Schema: transport; Owner: postgres
--

CREATE TRIGGER update_line_geoms_on_stop_change AFTER INSERT OR UPDATE OF geom ON transport.transit_stops FOR EACH ROW EXECUTE FUNCTION transport.rebuild_transit_line_geometry();


--
-- TOC entry 5823 (class 2606 OID 30668)
-- Name: role_foncier_adresses fk_code_generique_adresse; Type: FK CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_adresses
    ADD CONSTRAINT fk_code_generique_adresse FOREIGN KEY (code_generique_adresse) REFERENCES foncier.code_generique_adresse(code);


--
-- TOC entry 5824 (class 2606 OID 30673)
-- Name: role_foncier_adresses fk_code_lien_adresse; Type: FK CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_adresses
    ADD CONSTRAINT fk_code_lien_adresse FOREIGN KEY (code_lien_adresse) REFERENCES foncier.code_lien_adresse(code);


--
-- TOC entry 5825 (class 2606 OID 30678)
-- Name: role_foncier_adresses fk_code_orientation_adresse; Type: FK CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier_adresses
    ADD CONSTRAINT fk_code_orientation_adresse FOREIGN KEY (code_orientation_adresse) REFERENCES foncier.code_orientation_adresse(code);


--
-- TOC entry 5822 (class 2606 OID 30683)
-- Name: role_foncier role_foncier_code_utilisation; Type: FK CONSTRAINT; Schema: foncier; Owner: postgres
--

ALTER TABLE ONLY foncier.role_foncier
    ADD CONSTRAINT role_foncier_code_utilisation FOREIGN KEY (code_utilisation) REFERENCES foncier.code_utilisation(code);


--
-- TOC entry 5819 (class 2606 OID 887850)
-- Name: line_stops line_id_fkey; Type: FK CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.line_stops
    ADD CONSTRAINT line_id_fkey FOREIGN KEY (line_id) REFERENCES transport.transit_lines(line_id) ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 5821 (class 2606 OID 887860)
-- Name: transit_lines mode_id_fkey; Type: FK CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.transit_lines
    ADD CONSTRAINT mode_id_fkey FOREIGN KEY (mode_id) REFERENCES transport.transit_modes(mode_id) NOT VALID;


--
-- TOC entry 5820 (class 2606 OID 887855)
-- Name: line_stops stop_id_fkey; Type: FK CONSTRAINT; Schema: transport; Owner: postgres
--

ALTER TABLE ONLY transport.line_stops
    ADD CONSTRAINT stop_id_fkey FOREIGN KEY (stop_id) REFERENCES transport.transit_stops(stop_id) ON DELETE RESTRICT NOT VALID;


-- Completed on 2024-11-27 17:51:10

--
-- PostgreSQL database dump complete
--

