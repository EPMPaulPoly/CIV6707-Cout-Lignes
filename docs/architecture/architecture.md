# Architecture

L'architecture du site est relativement conventionnelle avec un frontend qui gère l'interface avec l'utilisateur, affiche les réseaux de transport et permet 
```mermaid
%%{init: {"flowchart": {"htmlLabels": false}} }%%
flowchart LR
    user["`Utilisateur`"]
    webpage["`Frontend
                TS
            localhost:3000`"]
    server["`Backend
            TS
            localhost:5000`"]
    database["`BD PostgreSQL
                +
                PostGIS
            localhost:5432`"];
    user -->|Click| webpage;
    webpage -->|localhost:5000/api/lines| server;
    server -->|SELECT * FROM transport.lines RETURNING *| database;
    database -->|line_id:1 mode_id:1 name| server;
    server -->|line_id:1 mode_id:1 name| webpage;
    webpage -->|Affichage| user;

```
