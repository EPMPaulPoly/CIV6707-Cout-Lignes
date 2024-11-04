PGDMP  !    7            
    |            test_role_foncier    16.3    16.3 "    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                        1262    16390    test_role_foncier    DATABASE     �   CREATE DATABASE test_role_foncier WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Canada.1252';
 !   DROP DATABASE test_role_foncier;
                postgres    false                       0    0    test_role_foncier    DATABASE PROPERTIES     g   ALTER DATABASE test_role_foncier SET search_path TO '2024', 'ECON40606', 'lignes_transport', 'public';
                     postgres    false            	            2615    29291    lignes_transport    SCHEMA         CREATE SCHEMA lignes_transport;
    DROP SCHEMA lignes_transport;
                postgres    false            	           1259    29320 
   line_stops    TABLE     �   CREATE TABLE lignes_transport.line_stops (
    assoc_id integer NOT NULL,
    line_id integer,
    stop_id integer,
    order_of_stop integer
);
 (   DROP TABLE lignes_transport.line_stops;
       lignes_transport         heap    postgres    false    9                       1259    29319    line_stops_assoc_id_seq    SEQUENCE     �   CREATE SEQUENCE lignes_transport.line_stops_assoc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE lignes_transport.line_stops_assoc_id_seq;
       lignes_transport          postgres    false    9    265                       0    0    line_stops_assoc_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE lignes_transport.line_stops_assoc_id_seq OWNED BY lignes_transport.line_stops.assoc_id;
          lignes_transport          postgres    false    264                       1259    29293    transit_lines    TABLE     �   CREATE TABLE lignes_transport.transit_lines (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    mode_id integer,
    color character varying(255)
);
 +   DROP TABLE lignes_transport.transit_lines;
       lignes_transport         heap    postgres    false    9                       1259    29292    transit_lines_id_seq    SEQUENCE     �   CREATE SEQUENCE lignes_transport.transit_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE lignes_transport.transit_lines_id_seq;
       lignes_transport          postgres    false    259    9                       0    0    transit_lines_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE lignes_transport.transit_lines_id_seq OWNED BY lignes_transport.transit_lines.id;
          lignes_transport          postgres    false    258                       1259    29311    transit_stops    TABLE     �   CREATE TABLE lignes_transport.transit_stops (
    stop_id integer NOT NULL,
    name character varying,
    is_station boolean,
    geography public.geography(Point,4326)
);
 +   DROP TABLE lignes_transport.transit_stops;
       lignes_transport         heap    postgres    false    9                       1259    29310    transit_stops_stop_id_seq    SEQUENCE     �   CREATE SEQUENCE lignes_transport.transit_stops_stop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE lignes_transport.transit_stops_stop_id_seq;
       lignes_transport          postgres    false    9    263                       0    0    transit_stops_stop_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE lignes_transport.transit_stops_stop_id_seq OWNED BY lignes_transport.transit_stops.stop_id;
          lignes_transport          postgres    false    262                       1259    29302    transport_modes    TABLE     �   CREATE TABLE lignes_transport.transport_modes (
    mode_id integer NOT NULL,
    name character varying(255),
    cost_per_km double precision,
    cost_per_station double precision,
    footprint double precision
);
 -   DROP TABLE lignes_transport.transport_modes;
       lignes_transport         heap    postgres    false    9                       1259    29301    transport_modes_mode_id_seq    SEQUENCE     �   CREATE SEQUENCE lignes_transport.transport_modes_mode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 <   DROP SEQUENCE lignes_transport.transport_modes_mode_id_seq;
       lignes_transport          postgres    false    261    9                       0    0    transport_modes_mode_id_seq    SEQUENCE OWNED BY     o   ALTER SEQUENCE lignes_transport.transport_modes_mode_id_seq OWNED BY lignes_transport.transport_modes.mode_id;
          lignes_transport          postgres    false    260            O           2604    29323    line_stops assoc_id    DEFAULT     �   ALTER TABLE ONLY lignes_transport.line_stops ALTER COLUMN assoc_id SET DEFAULT nextval('lignes_transport.line_stops_assoc_id_seq'::regclass);
 L   ALTER TABLE lignes_transport.line_stops ALTER COLUMN assoc_id DROP DEFAULT;
       lignes_transport          postgres    false    265    264    265            L           2604    29296    transit_lines id    DEFAULT     �   ALTER TABLE ONLY lignes_transport.transit_lines ALTER COLUMN id SET DEFAULT nextval('lignes_transport.transit_lines_id_seq'::regclass);
 I   ALTER TABLE lignes_transport.transit_lines ALTER COLUMN id DROP DEFAULT;
       lignes_transport          postgres    false    259    258    259            N           2604    29314    transit_stops stop_id    DEFAULT     �   ALTER TABLE ONLY lignes_transport.transit_stops ALTER COLUMN stop_id SET DEFAULT nextval('lignes_transport.transit_stops_stop_id_seq'::regclass);
 N   ALTER TABLE lignes_transport.transit_stops ALTER COLUMN stop_id DROP DEFAULT;
       lignes_transport          postgres    false    263    262    263            M           2604    29305    transport_modes mode_id    DEFAULT     �   ALTER TABLE ONLY lignes_transport.transport_modes ALTER COLUMN mode_id SET DEFAULT nextval('lignes_transport.transport_modes_mode_id_seq'::regclass);
 P   ALTER TABLE lignes_transport.transport_modes ALTER COLUMN mode_id DROP DEFAULT;
       lignes_transport          postgres    false    260    261    261            �          0    29320 
   line_stops 
   TABLE DATA           Y   COPY lignes_transport.line_stops (assoc_id, line_id, stop_id, order_of_stop) FROM stdin;
    lignes_transport          postgres    false    265   �(       �          0    29293    transit_lines 
   TABLE DATA           X   COPY lignes_transport.transit_lines (id, name, description, mode_id, color) FROM stdin;
    lignes_transport          postgres    false    259   Y)       �          0    29311    transit_stops 
   TABLE DATA           W   COPY lignes_transport.transit_stops (stop_id, name, is_station, geography) FROM stdin;
    lignes_transport          postgres    false    263   �)       �          0    29302    transport_modes 
   TABLE DATA           l   COPY lignes_transport.transport_modes (mode_id, name, cost_per_km, cost_per_station, footprint) FROM stdin;
    lignes_transport          postgres    false    261   +                  0    0    line_stops_assoc_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('lignes_transport.line_stops_assoc_id_seq', 125, true);
          lignes_transport          postgres    false    264                       0    0    transit_lines_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('lignes_transport.transit_lines_id_seq', 10, true);
          lignes_transport          postgres    false    258                       0    0    transit_stops_stop_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('lignes_transport.transit_stops_stop_id_seq', 22, true);
          lignes_transport          postgres    false    262            	           0    0    transport_modes_mode_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('lignes_transport.transport_modes_mode_id_seq', 5, true);
          lignes_transport          postgres    false    260            W           2606    29325    line_stops line_stops_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY lignes_transport.line_stops
    ADD CONSTRAINT line_stops_pkey PRIMARY KEY (assoc_id);
 N   ALTER TABLE ONLY lignes_transport.line_stops DROP CONSTRAINT line_stops_pkey;
       lignes_transport            postgres    false    265            Q           2606    29300     transit_lines transit_lines_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY lignes_transport.transit_lines
    ADD CONSTRAINT transit_lines_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY lignes_transport.transit_lines DROP CONSTRAINT transit_lines_pkey;
       lignes_transport            postgres    false    259            U           2606    29318     transit_stops transit_stops_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY lignes_transport.transit_stops
    ADD CONSTRAINT transit_stops_pkey PRIMARY KEY (stop_id);
 T   ALTER TABLE ONLY lignes_transport.transit_stops DROP CONSTRAINT transit_stops_pkey;
       lignes_transport            postgres    false    263            S           2606    29309 $   transport_modes transport_modes_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY lignes_transport.transport_modes
    ADD CONSTRAINT transport_modes_pkey PRIMARY KEY (mode_id);
 X   ALTER TABLE ONLY lignes_transport.transport_modes DROP CONSTRAINT transport_modes_pkey;
       lignes_transport            postgres    false    261            �   R   x���	 1��8̡�^�]n�9.�"��h1Q(�(j��D���<XQ��ҕ�Rj�ڡvcD�N��rz��vJ-�G�'"~�H,      �   T   x�3��M-)�W���K�t�,��KW(��,VHJ-)I-R�K�M�4�T60ps30�2�)J�U���JR�K�z8�@J@�+F��� ���      �   N  x����r� �k�)����s@	tI�i<�k�3�<y�`p�(P����v�xY��,���|�B�R�ӂ��h#kG��"��Z�P����"{�d�AV,�XV�|(�t9$mgd��!��b���s��<>��ـ�p��`5������2��i��@J�A%o�1	�F�ǰ��y�N�<^VP
��j��"C:�k(���"m��r���P�
���άr�[M�{-���p�5�o��D)���Qw���q�O�]�HP�Lm��|,�jt�u��Dk� Qu�P0�J��6��Q6��k�+�ұo62�l��R2U��s����۬      �   9   x�3��M-)��425�440�42�2�)J��4	p�r�r:� ���\1z\\\ (}	�     