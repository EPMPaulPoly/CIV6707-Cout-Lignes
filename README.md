# CIV6707-Cout-Lignes: Interface d'estimation
de coûts de lignes de transport
Estimations du cout de nouvelles infrastructures de transport à partir du rôle foncier et d'estimés de coûts pour des moyens de transport lourds.

## Documentation

[Installation](docs/installation/Installation.md)

[Revue de littérature sur les projections de coûts](docs/transit-infrastructure-costs/cost_estimation_review.md)

[L'expropriation au Québec](docs/transit-infrastructure-costs/expropriation_au_qc.md)

[Architecture de l'application](docs/architecture/architecture.md)

[Structure de la base de données](docs/database/database_specification.md)

[Structure de données de l'API](docs/api/API%20usage%20guide.md)

[Implémentation de l'API](docs/api/API%20implementation.md)

[Requêtes SQL](docs/api/sql%20requests%20documentation.md)

[Structure du frontend](docs/frontend/frontend_doc.md)

[Présentation en classe](docs/CIV6707 Projet B Prédiction couts Lignes de transport.pdf)
## Guides d'utilisation
Les guides d'utilisation montrent la procédure pour obtenir des couts. 
```mermaid
flowchart LR
  A[Création modes] --> B[Créations arrêts];
  B-->C[Création lignes];
  C-->D[Assignation des arrêts aux lignes];
  D-->E[Inférence du coût de la ligne];
```
Les documents suivants donne un aperçu de la procédure pour chaque étape:

[Création Modes](docs/guides/MODE_CREATION.md)

[Création Arrêts](docs/guides/STOPS_CREATION.md)

[Création Ligne](docs/guides/LINE_CREATION.md)

[Assignation des arrêts à la ligne](docs/guides/LINE_STOP_CREATION.md)

[Inférence du coût de la ligne](docs/guides/LINE_COST_INFERENCE.md)

## Survol de l'application
L'application est implémentée dans un interface web qui sert à la création d'arrêts de lignes, de modes et d'arrêts. Un aperçu de l'interface est donné ci-dessous.

![image](https://github.com/user-attachments/assets/a4f891ff-b393-4a52-bc77-d34f80b62891)
