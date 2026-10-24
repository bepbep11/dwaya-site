/*
 * DWAYA — réglages du site vitrine : contact et démo.
 * Les PRIX ne sont plus ici : ils sont dans prix.json (voir README.md), modifiable sans redéploiement.
 */
window.DWAYA_REGLAGES = {
  // Compte de démonstration en libre-service (même origine que l'application ; 404 = démo désactivée sur cette instance)
  demo: {
    endpoint: '/api/public/demo-accounts'
  },
  contact: {
    // À REMPLACER avant publication : adresse e-mail et numéro WhatsApp au format international sans « + » ni espaces
    // (ex. 212600000000). Tant que la valeur est CONTACT_A_DEFINIR, les boutons d'envoi affichent un avertissement.
    email: 'bepbep8ebbep@gmail.com',
    whatsapp: '212661425552'
  }
};
