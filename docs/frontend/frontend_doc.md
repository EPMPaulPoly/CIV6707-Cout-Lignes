# Frontend
Le frontend est l'application qui permet de visualiser les résultats ainsi qu'à l'utilisateur de définir les intrants nécessaires pour calculer les coûts. Ces derniers doivent définir les géométries des lignes, les couts par km des infrastructures en fonction du mode, ainsi que l'empreinte au sol du mode pour trouver les propriétés qui devront potentiellement être expropriées. La figure suivante donne un aperçu de l'architecture du frontend
```mermaid
%%{init: {"flowchart": {"htmlLabels": false}} }%%
flowchart LR
    subgraph public["public"]
    index["`index.html`"]
    end;
    indexts["`index.ts`"]
    apptsx["`App.tsx`"]
    appcss["`App.css`"]
    subgraph gest["Gestion de base"]
    index -->indexts;
    
    indexts-->apptsx;
    apptsx-->appcss;
    end;
    subgraph REACT["`Composantes REACT`"]
    components["`components`"]
    ResizableLayout["`ResizableLayout.tsx`"]
    Table["`Table.tsx`"]
    StaticTable["`StaticTable.tsx`"]
    Map[" Map.tsx`"]
    apptsx-->components;
    
    components-->ResizableLayout;
    ResizableLayout-->Table;
    ResizableLayout-->StaticTable;
    ResizableLayout-->Map;
    end;
    subgraph utilssub["utilitaires gestion des États"]
    utils["`utils`"]
    utilsts["`utils.ts`"]
    apptsx-->utils;
    ResizableLayout-->utils;
    Table -->utils;
    StaticTable-->utils;
    Map-->utils;
    end;
    subgraph apiint["Interface API"]
    utils-->utilsts;
    services["`services`"]
    indexservices["`index.ts`"]
    lineservice["`lineService.ts`"]
    stopservice["`stopService.ts`"]
    modeservice["`modeService.ts`"]
    cadservice["`cadastreService.ts`"]
    api["`api.ts`"]
    utilsts-->services;
    services-->indexservices;
    
    indexservices --> stopservice;
    indexservices --> modeservice;
    indexservices --> lineservice;
    indexservices --> cadservice;
    stopservice--> api;
    modeservice-->api;
    lineservice-->api;
    cadservice-->api;
    end;
```
