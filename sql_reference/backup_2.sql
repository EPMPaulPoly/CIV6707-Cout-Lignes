--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2024-11-04 17:39:16

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
-- TOC entry 9 (class 2615 OID 29291)
-- Name: lignes_transport; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA lignes_transport;


ALTER SCHEMA lignes_transport OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 265 (class 1259 OID 29320)
-- Name: line_stops; Type: TABLE; Schema: lignes_transport; Owner: postgres
--

CREATE TABLE lignes_transport.line_stops (
    assoc_id integer NOT NULL,
    line_id integer,
    stop_id integer,
    order_of_stop integer
);


ALTER TABLE lignes_transport.line_stops OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 29319)
-- Name: line_stops_assoc_id_seq; Type: SEQUENCE; Schema: lignes_transport; Owner: postgres
--

CREATE SEQUENCE lignes_transport.line_stops_assoc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE lignes_transport.line_stops_assoc_id_seq OWNER TO postgres;

--
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 264
-- Name: line_stops_assoc_id_seq; Type: SEQUENCE OWNED BY; Schema: lignes_transport; Owner: postgres
--

ALTER SEQUENCE lignes_transport.line_stops_assoc_id_seq OWNED BY lignes_transport.line_stops.assoc_id;


--
-- TOC entry 259 (class 1259 OID 29293)
-- Name: transit_lines; Type: TABLE; Schema: lignes_transport; Owner: postgres
--

CREATE TABLE lignes_transport.transit_lines (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    mode_id integer,
    color character varying(255)
);


ALTER TABLE lignes_transport.transit_lines OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 29292)
-- Name: transit_lines_id_seq; Type: SEQUENCE; Schema: lignes_transport; Owner: postgres
--

CREATE SEQUENCE lignes_transport.transit_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE lignes_transport.transit_lines_id_seq OWNER TO postgres;

--
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 258
-- Name: transit_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: lignes_transport; Owner: postgres
--

ALTER SEQUENCE lignes_transport.transit_lines_id_seq OWNED BY lignes_transport.transit_lines.id;


--
-- TOC entry 263 (class 1259 OID 29311)
-- Name: transit_stops; Type: TABLE; Schema: lignes_transport; Owner: postgres
--

CREATE TABLE lignes_transport.transit_stops (
    stop_id integer NOT NULL,
    name character varying,
    is_station boolean,
    geography public.geography(Point,4326)
);


ALTER TABLE lignes_transport.transit_stops OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 29310)
-- Name: transit_stops_stop_id_seq; Type: SEQUENCE; Schema: lignes_transport; Owner: postgres
--

CREATE SEQUENCE lignes_transport.transit_stops_stop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE lignes_transport.transit_stops_stop_id_seq OWNER TO postgres;

--
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 262
-- Name: transit_stops_stop_id_seq; Type: SEQUENCE OWNED BY; Schema: lignes_transport; Owner: postgres
--

ALTER SEQUENCE lignes_transport.transit_stops_stop_id_seq OWNED BY lignes_transport.transit_stops.stop_id;


--
-- TOC entry 261 (class 1259 OID 29302)
-- Name: transport_modes; Type: TABLE; Schema: lignes_transport; Owner: postgres
--

CREATE TABLE lignes_transport.transport_modes (
    mode_id integer NOT NULL,
    name character varying(255),
    cost_per_km double precision,
    cost_per_station double precision,
    footprint double precision
);


ALTER TABLE lignes_transport.transport_modes OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 29301)
-- Name: transport_modes_mode_id_seq; Type: SEQUENCE; Schema: lignes_transport; Owner: postgres
--

CREATE SEQUENCE lignes_transport.transport_modes_mode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE lignes_transport.transport_modes_mode_id_seq OWNER TO postgres;

--
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 260
-- Name: transport_modes_mode_id_seq; Type: SEQUENCE OWNED BY; Schema: lignes_transport; Owner: postgres
--

ALTER SEQUENCE lignes_transport.transport_modes_mode_id_seq OWNED BY lignes_transport.transport_modes.mode_id;


--
-- TOC entry 5711 (class 2604 OID 29323)
-- Name: line_stops assoc_id; Type: DEFAULT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.line_stops ALTER COLUMN assoc_id SET DEFAULT nextval('lignes_transport.line_stops_assoc_id_seq'::regclass);


--
-- TOC entry 5708 (class 2604 OID 29296)
-- Name: transit_lines id; Type: DEFAULT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transit_lines ALTER COLUMN id SET DEFAULT nextval('lignes_transport.transit_lines_id_seq'::regclass);


--
-- TOC entry 5710 (class 2604 OID 29314)
-- Name: transit_stops stop_id; Type: DEFAULT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transit_stops ALTER COLUMN stop_id SET DEFAULT nextval('lignes_transport.transit_stops_stop_id_seq'::regclass);


--
-- TOC entry 5709 (class 2604 OID 29305)
-- Name: transport_modes mode_id; Type: DEFAULT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transport_modes ALTER COLUMN mode_id SET DEFAULT nextval('lignes_transport.transport_modes_mode_id_seq'::regclass);


--
-- TOC entry 5882 (class 0 OID 29320)
-- Dependencies: 265
-- Data for Name: line_stops; Type: TABLE DATA; Schema: lignes_transport; Owner: postgres
--

COPY lignes_transport.line_stops (assoc_id, line_id, stop_id, order_of_stop) FROM stdin;
120	1	11	1
121	1	2	2
122	1	15	3
123	1	18	4
108	4	1	2
109	4	2	3
110	4	3	4
111	4	17	5
112	4	20	6
114	4	19	7
113	4	22	8
125	4	21	1
\.


--
-- TOC entry 5876 (class 0 OID 29293)
-- Dependencies: 259
-- Data for Name: transit_lines; Type: TABLE DATA; Schema: lignes_transport; Owner: postgres
--

COPY lignes_transport.transit_lines (id, name, description, mode_id, color) FROM stdin;
1	Metro Line	Giving this better name	1	#00FF00
4	Tram line	Tram testing	2	#000000
\.


--
-- TOC entry 5880 (class 0 OID 29311)
-- Dependencies: 263
-- Data for Name: transit_stops; Type: TABLE DATA; Schema: lignes_transport; Owner: postgres
--

COPY lignes_transport.transit_stops (stop_id, name, is_station, geography) FROM stdin;
1	test	t	0101000020E6100000AEF22BC8356952C0A2D8DC596DC24640
2	test2	t	0101000020E610000010E267E9B46852C0BCD68471C4C34640
3	test3	t	0101000020E610000032055556386852C0F2B3DD6F0FC54640
11	Testing Alone	t	0101000020E6100000010000709B6952C0B90D29CB85C44640
20	St-Michel	t	0101000020E610000001000090336652C04EA8777E1BC74640
22	Test add new lines	t	0101000020E610000001000040666552C0A1ED690D5DC94640
21	testing another thing alone	t	0101000020E610000001000020DC6952C005FC4FFA51C14640
18	New test	t	0101000020E6100000010000501A6552C090D1B66EEFC24640
15	checkedicheck	t	0101000020E610000001000030476752C04C66ABBC36C34640
19	unfuck this	t	0101000020E610000001000010C36552C0412C164E76C84640
17	New Stop 8	t	0101000020E6100000010000004A6752C0FC8F734333C64640
\.


--
-- TOC entry 5878 (class 0 OID 29302)
-- Dependencies: 261
-- Data for Name: transport_modes; Type: TABLE DATA; Schema: lignes_transport; Owner: postgres
--

COPY lignes_transport.transport_modes (mode_id, name, cost_per_km, cost_per_station, footprint) FROM stdin;
1	Metro	250	100	20
2	Tram	70	10	15
5	BRT	15	5	8
\.


--
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 264
-- Name: line_stops_assoc_id_seq; Type: SEQUENCE SET; Schema: lignes_transport; Owner: postgres
--

SELECT pg_catalog.setval('lignes_transport.line_stops_assoc_id_seq', 125, true);


--
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 258
-- Name: transit_lines_id_seq; Type: SEQUENCE SET; Schema: lignes_transport; Owner: postgres
--

SELECT pg_catalog.setval('lignes_transport.transit_lines_id_seq', 10, true);


--
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 262
-- Name: transit_stops_stop_id_seq; Type: SEQUENCE SET; Schema: lignes_transport; Owner: postgres
--

SELECT pg_catalog.setval('lignes_transport.transit_stops_stop_id_seq', 22, true);


--
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 260
-- Name: transport_modes_mode_id_seq; Type: SEQUENCE SET; Schema: lignes_transport; Owner: postgres
--

SELECT pg_catalog.setval('lignes_transport.transport_modes_mode_id_seq', 5, true);


--
-- TOC entry 5719 (class 2606 OID 29325)
-- Name: line_stops line_stops_pkey; Type: CONSTRAINT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.line_stops
    ADD CONSTRAINT line_stops_pkey PRIMARY KEY (assoc_id);


--
-- TOC entry 5713 (class 2606 OID 29300)
-- Name: transit_lines transit_lines_pkey; Type: CONSTRAINT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transit_lines
    ADD CONSTRAINT transit_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 5717 (class 2606 OID 29318)
-- Name: transit_stops transit_stops_pkey; Type: CONSTRAINT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transit_stops
    ADD CONSTRAINT transit_stops_pkey PRIMARY KEY (stop_id);


--
-- TOC entry 5715 (class 2606 OID 29309)
-- Name: transport_modes transport_modes_pkey; Type: CONSTRAINT; Schema: lignes_transport; Owner: postgres
--

ALTER TABLE ONLY lignes_transport.transport_modes
    ADD CONSTRAINT transport_modes_pkey PRIMARY KEY (mode_id);


-- Completed on 2024-11-04 17:39:16

--
-- PostgreSQL database dump complete
--

