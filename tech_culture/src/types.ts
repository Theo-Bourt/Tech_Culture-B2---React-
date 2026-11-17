export interface Company {
  id: string;
  nom: string;
  pays: string;
  secteur: string;
  fondation: number;
  capitalisation: number; 
  chiffreAffaires: number; 
  effectifs: number;
  siege: { ville: string; lat: number; lng: number };
  logo?: string;
  banniere?: string;
  description: string;
  pointsCles: string[];
  dirigeants: Leader[];
  activites: RevenueBreakdown;
  services: string[];
  logiciels: CompanySoftware;
  categorie: CompanyCategory;
  // Fait partie des 9 entreprises les plus connues, affichées en carte sur l'accueil
  vedette?: boolean;
  // Devise du chiffre d'affaires quand ce n'est pas le dollar
  devise?: "€";
}

// Lien orienté : `source` fournit `cible` ou lui sert de plateforme
export interface CompanyRelation {
  source: string;
  cible: string;
  description: string;
  lien: string;
}

export interface Leader {
  nom: string;
  titre: string;
  depuis: number;
  // Absente quand aucune photo sous licence libre n'existe : on affiche les initiales
  photo?: string;
  credit?: { auteur: string; licence: string; url: string };
}

export type CompanyCategory =
  | "IA"
  | "Puces"
  | "Logiciels et cloud"
  | "Internet"
  | "Matériel";

export interface CompanySoftware {
  crees: string[];
  noteCrees?: string;
  // Vide si l'entreprise ne documente pas ses outils : on ne devine pas
  utilises: { nom: string; source: string }[];
  noteUtilises?: string;
}

export interface RevenueBreakdown {
  // Mois de clôture du dernier exercice publié. Absent pour une société non cotée.
  exercice?: string;
  source: string;
  // Parts en pourcentage du chiffre d'affaires. Vide si l'entreprise ne les publie pas.
  segments: { nom: string; part: number }[];
  note?: string;
}

// Renommé TechEvent pour ne pas confondre avec le composant TimelineEvent
export interface TechEvent {
  id: string;
  entrepriseId: string;
  annee: number;
  titre: string;
  categorie: "produit" | "acquisition" | "technologie" | "entreprise";
  description: string;
  liens: string[]; 
}


// ids d'événements liés (utilisés plus tard par bfs.ts)

export type GroupBy = "capitalisation" | "chiffreAffaires" | "pays" | "secteur";

export interface CompanyGroup {
  label: string;
  companies: Company[];
}
