# CIV6707-Cout-Lignes
Estimations du cout de nouvelles infrastructures de transport à partir du rôle foncier 

## Apercu de l'interface
L'interface permet de créer directement des lignes de transports en commun de différents modes et de créer des tracés de lignes:
![image](https://github.com/user-attachments/assets/56185133-6fce-46b6-ad88-02fa062374e8)
### Lignes
Des entêtes de lignes avec nom description et mode utilisé peuvent être utilisées:
![image](https://github.com/user-attachments/assets/fd20507f-6700-4557-8181-1b12a4e4d4d6)
### Modes
Les modes peuvent être définis par leur emprise au sol, leur cout lineaire et le cout des stations
![image](https://github.com/user-attachments/assets/3a3c0668-5d84-48b8-85e9-74bc18310f35)
### Points de controle
Des points de controle sont créés. En appuyant sur add, on est invité à sélectionner sur la carte
![image](https://github.com/user-attachments/assets/1d4410c2-5406-4087-a1dc-bb0fdcd643a2)
En ajoutant, on a une invitation a donner un nom et a selectionner un endroit
![image](https://github.com/user-attachments/assets/0672cb62-3d0c-46ec-b385-70cefb0d3159)
### Tracés de lignes
Les tracés de lignes sont définis par des linestops donnant une liste d'arrets et leur ordre dans la ligne
![image](https://github.com/user-attachments/assets/94753e3a-c75f-4603-8aa2-69f7007d401c)
On peut sélectionner si on veut insérer en début fin ou après un arrêt
![image](https://github.com/user-attachments/assets/2fd4844e-7dbf-44d4-a673-e9f13f5bee6c)
Le booléen is_station permet de définir s'il s'agit d'une station ou simplement d'un point de contrôle ou le moyen de transport ne s'arretera pas
![image](https://github.com/user-attachments/assets/f77dd12a-ba6d-4124-b7c7-2c88d8b9fe89)

## Installation requirements
node.js latest installation file: https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi \
docker latest installation file: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module&_gl=1*1q71v3*_gcl_au*MjQzMTQ2MTguMTcyNjk0MDM3Ng..*_ga*MTYzMTYzMjQ2My4xNzI2OTMxNDY2*_ga_XJWPQMJYHQ*MTcyNjk3Nzg4MC40LjEuMTcyNjk3Nzg4My41Ny4wLjA. \
git : https://git-scm.com/download/win

## Comment le faire marcher:

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
