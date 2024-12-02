# Requêtes SQL

[Retour au README](../../README.md)

## 1. Création de la base de données (Transport_System)

Sur pgAdmin, la première étape consistait à structurer les tables pour gérer les informations sur les systèmes de transport. Ces tables incluent :

- **Transit_lines** : Lignes de transport
- **Transit_stops** : Arrêts de transport
- **Line_stops** : Association entre lignes et arrêts
- **Transport_modes** : Modes de transport

---

## 2. Insertion des données

À l'aide de l'outil de requêtes (**Query Tool**) dans pgAdmin, des requêtes SQL ont été écrites pour :

- Créer les tables
- Définir leurs colonnes et caractéristiques
- Insérer manuellement les données nécessaires dans ces tables

---

## 3. Transformation en PostGIS (Géométrie et Indexation Spatiale)

La base de données `Transport_System` a été convertie en PostGIS pour gérer des données géospatiales :

- Ajout d'une **colonne géométrique** pour la table `transit_stops`, incluant des **index spatiaux** pour faciliter les requêtes géospatiales.
- Même processus pour `transit_lines`, avec un **SRID 4326** (latitude, longitude transformée en points géographiques).

---

## 4. Mise en place des schémas et fusion des bases de données

Trois schémas ont été créés dans la base de données `merged_database` :

1. **Foncier** : Contient les données de `role_foncier`.
2. **Transport** : Contient les 4 tables principales relatives au transport.
3. **Cadastre** : Contient les informations cadastrales (`cadastre_montreal`).

---

## 5. Conversion des données en EPSG 3857

Les tables suivantes ont été transformées en EPSG 3857 pour obtenir des mesures en mètres :

- `role_foncier`
- `transit_lines`
- `cadastre_montreal`

Des **index spatiaux** ont été créés pour optimiser les calculs d’intersections.

---

## 6. Calculs d’intersections avec des buffers

Pour analyser les intersections entre les lignes de transit, les parcelles cadastrales et les données foncières :

- Un **buffer** de 50 m a été créé autour des lignes de transit.
- Les étapes suivantes ont été réalisées :
  1. Création d'un buffer autour d’une ligne de transit.
  2. Identification des intersections entre les parcelles cadastrales et les données foncières. 
  3. Calcul des intersections entre ces résultats et le buffer.Pour les petits lots (<5000m²) : on considère une expropriation totale.Pour les grands lots (>5000m²) : on calcule une valeur proportionnelle à la surface touchée
  4. Ensuite on estime les coûts d'infrastructures basée sur : La longueur de la ligne (coût au kilomètre) et Le nombre de stations (coût unitaire par station) 
  5. Extraction du **coût total** dans la zone tampon pour chaque ligne avec les parcelles impactées

---

## 7. Fonctions et Triggers

Des **trigger functions** ont été créées pour automatiser les mises à jour dans les tables en cas de modifications :

### Modification des arrêts de transport
Lorsqu’un arrêt d'une ligne est ajouté, supprimé ou modifié :

- La géométrie de la ligne de transport est recalculée en prenant en compte l'ordre des arrêts.


### Modification du footprint d'un mode de transport
Si l'empreinte d'un mode de transport change (par exemple, sa taille ou son impact) :

- Le **buffer** autour de la géométrie de la ligne est mis à jour automatiquement.
