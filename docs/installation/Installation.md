# Méthodologie d'installation
[Retour au README](../../README.md)
## Requis d'installation
node.js latest installation file: https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi \
docker latest installation file: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module&_gl=1*1q71v3*_gcl_au*MjQzMTQ2MTguMTcyNjk0MDM3Ng..*_ga*MTYzMTYzMjQ2My4xNzI2OTMxNDY2*_ga_XJWPQMJYHQ*MTcyNjk3Nzg4MC40LjEuMTcyNjk3Nzg4My41Ny4wLjA. \
git : https://git-scm.com/download/win

## Clonage des données:

La procédure a été pas mal chiante de mon côté donc je vais essayer de faire de mon mieux:
1. Installer les fichiers ci-dessus
2. Créer un dossier dans lequel vous voulez travailler
3. Faites un clic droit et selectionnez "Open GIT bash here"
   ![image](https://github.com/user-attachments/assets/798fd80f-210f-4be2-aa3c-52fbc0981625)
4. Allez à ce Github sur la page de landing de ce projet. En haut à droite, il y a un bouton code <>Code. Cliquez dessus et copiez le lien qui est donné.
5. Retournez à la fenetre git entrez: git clone https://github.com/EPMPaulPoly/CIV6707-Cout-Lignes.git
6. Vous devriez maintenant avoir les fichiers dans votre dossier
7. Dans votre dossier faites clic droit-> ouvrir dans terminal
8. entrez la commande docker-compose build
9. Une fois la commande completée entrez la commande docker-compose up

Vous devriez maintenant avoir une fenêtre ouverte qui montre notre application

## Mise en place de la structure de la BD
Une sauvegarde de la structure de la base de données a été ajouté au [github](../../sql_reference/database_structure_backup.sql) qui devrait permettre de mettre en places les tables pertinentes dans la base de données. Il sera potentiellement nécessaire de supprimer les schémas du cadastre lorsque ces derniers sont importés plus tard

## Importation du rôle foncier. 
Toutes les requêtes ont été créées en utilisant la version modifiée du rôle foncier fournie par la chaire Mobilité. Pour charger les données, le logiciel psql est utilisé pour importer les données
- Entrez vos informations de connection
- Entrez la commande suivante:
```
  \i 'C:\\Users\\... le reste du chemin vers le fichier obtenu\\cadastre.sql'
```
- Les entrées du rôle seront alors ajoutées à la base de données. Un peu de travail sera potentiellement requis dans pgadmin pour s'assurer que la table du role foncier soit dans le scheme "foncier" et le nom de la table soit 
role_foncier
## Importation du cadastre
Pour importer le cadastre, utiliser la procédure suivante:
- Allez télécharger le cadastre de l'année du rôle foncier sur [géo-index](https://geoapp.bibl.ulaval.ca/)
- Ouvrir le shpfile résultant dans qgis
- Faites un clic droit sur la couche
<img width="591" alt="exportation_sql" src="https://github.com/user-attachments/assets/6e5a8911-39f8-4965-abb7-d131e03dade0">
- assurer vous de rentrer le nom wkb_geometry comme nom de géométrie et choisissez un fichier à utiliser
  <img width="782" alt="save_sql" src="https://github.com/user-attachments/assets/b3eb3d24-2f0d-451a-b361-2c56d20ef259">
- Répétez la procédure utilisant psql utilisée pour le rôle foncier.
