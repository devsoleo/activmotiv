const tasksList = [
  {
    id: "1",
    uid: "t1",
    title: "F-SUS",
    status: {
      open: {
        content: "Vous avez votre F-SUS à remplir !",
        action: { type: "link", path: "/(questionnaires)/fsus", text: "Remplir mon F-SUS" }
      },
      closed: {}
    }
  },
  {
    id: "2",
    uid: "t2",
    title: "Questionnaire",
    status: {
      open: {
        content: "Vous avez un questionnaire à remplir !",
        action: { type: "link", path: "/(questionnaires)/generic", text: "Remplir le questionnaire" }
      },
      closed: {}
    }
  },
  {
    id: "3",
    uid: "t3",
    title: "Composer et évaluer ma galerie",
    status: {
      open: {
        content: "Choisissez les images qui vous parlent le plus et notez votre ressenti.",
        action: { type: "link", path: "/(tabs)/(settings)/images", text: "Évaluer mes images" },
      },
      closed: {}
    }
  }
]

export { tasksList }