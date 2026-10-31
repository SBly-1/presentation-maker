import type { Slide } from "./slide.js";

type Presentation = {
  id: string;
  name: string;
  slides: Slide[];
};

export type { Presentation };
