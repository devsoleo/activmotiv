const fsusList = [
  { id: '1', uid: 'f1', content: "Je voudrais utiliser cette application fréquemment", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '2', uid: 'f2', content: "Cette application est inutilement complexe", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '3', uid: 'f3', content: "Cette application est facile à utiliser", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '4', uid: 'f4', content: "J'aurais besoin du soutien d'un technicien pour être capable d'utiliser cette application", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '5', uid: 'f5', content: "Les différentes fonctionnalités de cette application sont bien intégrées", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '6', uid: 'f6', content: "Il y a trop d'incohérences dans cette application", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '7', uid: 'f7', content: "La plupart des gens apprendront à utiliser cette application très rapidement", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '8', uid: 'f8', content: "Cette application est très lourde à utiliser", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '9', uid: 'f9', content: "Je me suis senti(e) très en confiance en utilisant cette application", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] },
  { id: '10', uid: 'f10', content: "J'ai eu besoin d'apprendre beaucoup de choses avant de pouvoir utiliser cette application", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 5 }] }
]

const attitudeList = [
  {
    id: '1',
    uid: 'a1',
    content: "Pour moi, faire de l'activité physique régulière est...",
    answers: [
      { minimum: "Inutile", maximum: "Utile", size: 7 },
      { minimum: "Néfaste", maximum: "Bénéfique", size: 7 },
      { minimum: "Imprudent", maximum: "Sage", size: 7 }
    ]
  },
  {
    id: '2',
    uid: 'a2',
    content: "Pour moi, faire de l'activité physique régulière est...",
    answers: [
      { minimum: "Désagréable", maximum: "Agréable", size: 7 },
      { minimum: "Ennuyeux", maximum: "Amusant", size: 7 },
      { minimum: "Déplaisant", maximum: "Plaisant", size: 7 }
    ]
  }
]

const motivationList = [
  { id: '1', uid: 'm1', content: "Je vais faire des efforts pour pratiquer une activité physique régulière au cours de la prochaine semaine", answers: [{ minimum: "Aucun effort", maximum: "Le maximum d'effort possible", size: 7 }] },
  { id: '2', uid: 'm2', content: "Je suis motivé(e) à pratiquer une activité physique régulière au cours de la prochaine semaine", answers: [{ minimum: "Extrêmement démotivé(e)", maximum: "Extrêmement motivé(e)", size: 7 }] }
]

const intentionList = [
  { id: '1', uid: 'i1', content: "J'ai l'intention de pratiquer une activité physique régulière au cours de la prochaine semaine", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 7 }] },
  { id: '2', uid: 'i2', content: "Je prévois de pratiquer une activité physique régulière au cours de la prochaine semaine", answers: [{ minimum: "Pas du tout d'accord", maximum: "Tout à fait d'accord", size: 7 }] }
]

export { fsusList, attitudeList, motivationList, intentionList }