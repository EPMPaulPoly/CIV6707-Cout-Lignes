--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2024-10-18 17:57:04

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 27217)
-- Name: line_stops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.line_stops (
    id integer NOT NULL,
    line_id integer,
    stop_id integer,
    order_of_stop integer NOT NULL,
    is_station boolean NOT NULL
);


ALTER TABLE public.line_stops OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 27216)
-- Name: line_stops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.line_stops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.line_stops_id_seq OWNER TO postgres;

--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 221
-- Name: line_stops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.line_stops_id_seq OWNED BY public.line_stops.id;


--
-- TOC entry 218 (class 1259 OID 27201)
-- Name: transit_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transit_lines (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    mode character varying(50) NOT NULL
);


ALTER TABLE public.transit_lines OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 27200)
-- Name: transit_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transit_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transit_lines_id_seq OWNER TO postgres;

--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 217
-- Name: transit_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transit_lines_id_seq OWNED BY public.transit_lines.id;


--
-- TOC entry 216 (class 1259 OID 27194)
-- Name: transit_stops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transit_stops (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    is_complete boolean NOT NULL
);


ALTER TABLE public.transit_stops OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 27193)
-- Name: transit_stops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transit_stops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transit_stops_id_seq OWNER TO postgres;

--
-- TOC entry 4821 (class 0 OID 0)
-- Dependencies: 215
-- Name: transit_stops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transit_stops_id_seq OWNED BY public.transit_stops.id;


--
-- TOC entry 220 (class 1259 OID 27210)
-- Name: transport_modes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_modes (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    cost_per_km numeric(10,2) NOT NULL,
    cost_per_station numeric(10,2) NOT NULL,
    footprint integer NOT NULL
);


ALTER TABLE public.transport_modes OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 27209)
-- Name: transport_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transport_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transport_modes_id_seq OWNER TO postgres;

--
-- TOC entry 4822 (class 0 OID 0)
-- Dependencies: 219
-- Name: transport_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transport_modes_id_seq OWNED BY public.transport_modes.id;


--
-- TOC entry 4652 (class 2604 OID 27220)
-- Name: line_stops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_stops ALTER COLUMN id SET DEFAULT nextval('public.line_stops_id_seq'::regclass);


--
-- TOC entry 4650 (class 2604 OID 27204)
-- Name: transit_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transit_lines ALTER COLUMN id SET DEFAULT nextval('public.transit_lines_id_seq'::regclass);


--
-- TOC entry 4649 (class 2604 OID 27197)
-- Name: transit_stops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transit_stops ALTER COLUMN id SET DEFAULT nextval('public.transit_stops_id_seq'::regclass);


--
-- TOC entry 4651 (class 2604 OID 27213)
-- Name: transport_modes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_modes ALTER COLUMN id SET DEFAULT nextval('public.transport_modes_id_seq'::regclass);


--
-- TOC entry 4813 (class 0 OID 27217)
-- Dependencies: 222
-- Data for Name: line_stops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.line_stops (id, line_id, stop_id, order_of_stop, is_station) FROM stdin;
1	1	2	1	t
2	1	1	2	t
3	1	3	3	t
4	1	6	4	t
5	2	4	1	t
6	2	1	2	t
7	2	5	3	t
\.


--
-- TOC entry 4809 (class 0 OID 27201)
-- Dependencies: 218
-- Data for Name: transit_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transit_lines (id, name, description, mode) FROM stdin;
1	Green Line	East-West Line	Metro
2	Yellow Line	NS Line	Tram
\.


--
-- TOC entry 4807 (class 0 OID 27194)
-- Dependencies: 216
-- Data for Name: transit_stops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transit_stops (id, name, latitude, longitude, is_complete) FROM stdin;
1	Montreal Central	45.54915200	-73.61368000	t
2	EO 1	45.53000000	-73.63000000	t
3	EO 2	45.57000000	-73.60000000	t
4	NS 1	45.56000000	-73.64000000	t
5	NS 2	45.54000000	-73.59000000	t
6	Random	45.56000000	-73.57000000	t
\.


--
-- TOC entry 4811 (class 0 OID 27210)
-- Dependencies: 220
-- Data for Name: transport_modes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport_modes (id, name, cost_per_km, cost_per_station, footprint) FROM stdin;
1	Metro	1000.00	0.20	50
2	Tram	70.00	0.07	20
\.


--
-- TOC entry 4823 (class 0 OID 0)
-- Dependencies: 221
-- Name: line_stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.line_stops_id_seq', 7, true);


--
-- TOC entry 4824 (class 0 OID 0)
-- Dependencies: 217
-- Name: transit_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transit_lines_id_seq', 2, true);


--
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 215
-- Name: transit_stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transit_stops_id_seq', 6, true);


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 219
-- Name: transport_modes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transport_modes_id_seq', 2, true);


--
-- TOC entry 4660 (class 2606 OID 27222)
-- Name: line_stops line_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_stops
    ADD CONSTRAINT line_stops_pkey PRIMARY KEY (id);


--
-- TOC entry 4656 (class 2606 OID 27208)
-- Name: transit_lines transit_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transit_lines
    ADD CONSTRAINT transit_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 4654 (class 2606 OID 27199)
-- Name: transit_stops transit_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transit_stops
    ADD CONSTRAINT transit_stops_pkey PRIMARY KEY (id);


--
-- TOC entry 4658 (class 2606 OID 27215)
-- Name: transport_modes transport_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_modes
    ADD CONSTRAINT transport_modes_pkey PRIMARY KEY (id);


--
-- TOC entry 4661 (class 2606 OID 27223)
-- Name: line_stops line_stops_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_stops
    ADD CONSTRAINT line_stops_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.transit_lines(id);


--
-- TOC entry 4662 (class 2606 OID 27228)
-- Name: line_stops line_stops_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_stops
    ADD CONSTRAINT line_stops_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.transit_stops(id);


-- Completed on 2024-10-18 17:57:07

--
-- PostgreSQL database dump complete
--

