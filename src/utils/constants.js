export const CONSULTATION_TYPES = [
    'Évaluation de profil',
    'Travailleurs qualifiés',
    'Permis d\'études',
    'Regroupement familial',
    'Gens d\'affaires',
    'Visa temporaire',
    'Révision de refus',
    'Citoyenneté',
    'Autre'
  ];
  
  export const DURATIONS = {
    30: '30 minutes',
    60: '60 minutes',
    90: '90 minutes'
  };
  
  export const PRICES = {
    CAD: { 30: 50, 60: 90, 90: 130 },
    MAD: { 30: 500, 60: 900, 90: 1300 }
  };
  
  export const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  
  export const COMPANY_INFO = {
    name: 'Firmament Immigration Canada',
    tagline: 'Excellence en Immigration',
    expert: {
      name: 'Abdelaziz AMMARI',
      title: 'Consultant Réglementé en Immigration Canadienne',
      credentials: [
        'Consultant Réglementé en Immigration Canadienne - CISR',
        'Regulated Canadian Immigration Consultant - IRB',
        'Membre certifié CRIC-CISR & RCIC-IRB',
        'Plus de 10 ans d\'expérience en immigration canadienne'
      ]
    },
    contact: {
      email: 'contact@firmamentimmigration.ca',
      phone: '+1 (514) 123-4567',
      address: 'Montréal, Québec, Canada'
    }
  };
  
  export const SERVICES = [
    {
      id: 'work-visa',
      icon: 'Briefcase',
      title: 'Visa de Travail',
      description: 'Assistance complète pour l\'obtention de votre visa de travail temporaire ou permanent au Canada.',
      consultationType: 'Visa temporaire'
    },
    {
      id: 'student-visa',
      icon: 'GraduationCap',
      title: 'Visa Étudiant',
      description: 'Guidance pour les étudiants souhaitant poursuivre leurs études dans les meilleures universités canadiennes.',
      consultationType: 'Permis d\'études'
    },
    {
      id: 'permanent-residence',
      icon: 'Home',
      title: 'Résidence Permanente',
      description: 'Accompagnement pour votre demande de résidence permanente via les programmes d\'immigration.',
      consultationType: 'Travailleurs qualifiés'
    },
    {
      id: 'family-reunification',
      icon: 'Heart',
      title: 'Regroupement Familial',
      description: 'Aide pour faire venir votre famille au Canada grâce aux programmes de parrainage.',
      consultationType: 'Regroupement familial'
    },
    {
      id: 'entrepreneur-program',
      icon: 'Briefcase',
      title: 'Programme des Entrepreneurs',
      description: 'Conseils pour les investisseurs et entrepreneurs souhaitant s\'établir au Québec.',
      consultationType: 'Gens d\'affaires'
    },
    {
      id: 'file-review',
      icon: 'FileText',
      title: 'Révision de Dossiers',
      description: 'Analyse et amélioration de vos dossiers d\'immigration pour maximiser vos chances de succès.',
      consultationType: 'Révision de refus'
    }
  ];
  
  export const STATS = [
    { value: '1000+', label: 'Clients Satisfaits' },
    { value: '98%', label: 'Taux de Réussite' },
    { value: '10+', label: 'Années d\'Expérience' },
    { value: '24/7', label: 'Support Client' }
  ];