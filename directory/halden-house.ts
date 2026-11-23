import type { Building } from "../src/directory";

export const haldenHouseBuilding: Building = {
  id: "halden-house",
  label: "Halden House",
  templateModule: "templates/sign-family.tsx",
  templateId: "sightline.SignFamily",
  pictogramDir: "assets/pictograms",
  destinations: [
    {
      slug: "car-park",
      destination: "Car park",
      long: "Visitor car park — follow the blue P signs past the north gate and the delivery bay",
      medium: "Visitor car park, north gate",
      short: "Visitor car park",
      arrow: "right",
      pictogram: "car-park",
    },
    {
      slug: "toilets",
      destination: "Toilets",
      long: "Toilets and accessible toilet, through the double doors on your left",
      medium: "Toilets, on your left",
      short: "Toilets",
      arrow: "left",
      pictogram: "toilets",
    },
    {
      slug: "reception",
      destination: "Reception",
      long: "Reception and visitor sign-in, at the top of the main stair",
      medium: "Reception, main stair",
      short: "Reception",
      arrow: "up",
      pictogram: "reception",
    },
    {
      slug: "lift",
      destination: "Lifts",
      long: "Lifts to levels one to four, past reception on the right",
      medium: "Lifts, past reception",
      short: "Lifts",
      arrow: "right",
      pictogram: "lift",
    },
  ],
};
