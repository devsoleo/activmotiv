export const STATIC_BASE_URL = 'https://activmotiv.fr/static/'
export const STATIC_API_KEY = 'b4b01d6c7472362a30ac5470aac7f6be'

export const getStaticImageUrl = (relativePath: string) => `${STATIC_BASE_URL}${relativePath}?key=${STATIC_API_KEY}`

const apExerciceImages = [
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_12.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_13.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_14.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_15.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_16.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_17.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_18.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_19.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_20.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_21.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_22.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_23.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_24.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_25.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_26.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_27.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_28.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_29.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_30.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_31.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_32.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Exercice/APEX_33.jpg") } },
]

const apLoisirsImages = [
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_12.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_13.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_14.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_15.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_16.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_17.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_18.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_19.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_20.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_21.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_22.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_23.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_24.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_25.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_26.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_27.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_Loisirs/APLT_28.jpg") } },
]

const apTransportsActifsImages = [
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_12.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_13.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_14.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_15.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_16.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_17.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_18.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_19.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_20.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_21.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_22.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_23.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_24.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/AP/AP_TransportsActifs/APTA_25.jpg") } },
]

const usAccomplissementImages = [
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Accomplissement/USAC_12.jpg") } },
]

const usAnimauxImages = [
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_12.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Animaux/USAN_13.jpg") } },
]

const usNatureImages = [
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Nature/USNA_9.jpg") } },
]

const usPlaisirImages = [
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_5.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_6.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_7.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_8.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_9.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_10.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_11.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_12.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_13.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_14.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_15.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_16.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_Plaisir/USPL_17.jpg") } },
]

const usRelationSocialeImages = [
  { source: { uri: getStaticImageUrl("illustrations/POS/US_RelationSociale/USRS_1.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_RelationSociale/USRS_2.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_RelationSociale/USRS_3.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_RelationSociale/USRS_4.jpg") } },
  { source: { uri: getStaticImageUrl("illustrations/POS/US_RelationSociale/USRS_5.jpg") } },
]

const illustrationsList = [
  ...apExerciceImages,
  ...apLoisirsImages,
  ...apTransportsActifsImages,
  ...usAccomplissementImages,
  ...usAnimauxImages,
  ...usNatureImages,
  ...usPlaisirImages,
  ...usRelationSocialeImages,
]

const valenceList = [
  { source: require("@/assets/images/sam/valence_1.png") },
  { source: require("@/assets/images/sam/valence_2.png") },
  { source: require("@/assets/images/sam/valence_3.png") },
  { source: require("@/assets/images/sam/valence_4.png") },
  { source: require("@/assets/images/sam/valence_5.png") }
]

const arousalList = [
  { source: require("@/assets/images/sam/arousal_1.png") },
  { source: require("@/assets/images/sam/arousal_2.png") },
  { source: require("@/assets/images/sam/arousal_3.png") },
  { source: require("@/assets/images/sam/arousal_4.png") },
  { source: require("@/assets/images/sam/arousal_5.png") }
]

const valenceDarkList = [
  { source: require("@/assets/images/sam/valence_dark_1.png") },
  { source: require("@/assets/images/sam/valence_dark_2.png") },
  { source: require("@/assets/images/sam/valence_dark_3.png") },
  { source: require("@/assets/images/sam/valence_dark_4.png") },
  { source: require("@/assets/images/sam/valence_dark_5.png") }
]

const arousalDarkList = [
  { source: require("@/assets/images/sam/arousal_dark_1.png") },
  { source: require("@/assets/images/sam/arousal_dark_2.png") },
  { source: require("@/assets/images/sam/arousal_dark_3.png") },
  { source: require("@/assets/images/sam/arousal_dark_4.png") },
  { source: require("@/assets/images/sam/arousal_dark_5.png") }
]

export { illustrationsList, valenceList, arousalList, valenceDarkList, arousalDarkList, apExerciceImages, apLoisirsImages, apTransportsActifsImages, usAccomplissementImages, usAnimauxImages, usNatureImages, usPlaisirImages, usRelationSocialeImages }
