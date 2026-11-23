import type { Building } from "../src/directory";

export const foundryNineBuilding: Building = {
  id: "foundry-nine",
  label: "Foundry Nine",
  templateModule: "templates/sign-family-foundry.tsx",
  templateId: "sightline.SignFamilyFoundry",
  pictogramDir: "assets/pictograms/light",
  destinations: [
    {
      slug: "car-park",
      destination: "Car park",
      long: "Staff and visitor parking, entered from Foundry Lane at the rear of the building",
      medium: "Parking, Foundry Lane",
      short: "Parking",
      arrow: "right",
      pictogram: "car-park",
    },
    {
      slug: "toilets",
      destination: "Toilets",
      long: "Toilets, changing places and showers, along the north wall of the workshop",
      medium: "Toilets, north wall",
      short: "Toilets",
      arrow: "left",
      pictogram: "toilets",
    },
    {
      slug: "reception",
      destination: "Reception",
      long: "Reception and site induction, first floor above the loading bay",
      medium: "Reception, first floor",
      short: "Reception",
      arrow: "up",
      pictogram: "reception",
    },
    {
      slug: "lift",
      destination: "Lifts",
      long: "Freight and passenger lifts, beyond the loading bay on the left",
      medium: "Lifts, beyond loading",
      short: "Lifts",
      arrow: "left",
      pictogram: "lift",
    },
  ],
};
