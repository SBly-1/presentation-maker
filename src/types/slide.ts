import type { SlideObject } from "./objects.js";

type Slide = {
  id: string;
  name: string;
  background: Background;
  objects: SlideObject[];
};

type BackgroundColor = {
  type: "color";
  color: string;
};

type BackgroundImage = {
  type: "image";
  imageUrl: string;
};

type BackgroundGradient = {
  type: "gradient";
  colors: string[];
  angle: number;
};

type Background = BackgroundColor | BackgroundImage | BackgroundGradient;

export type { Slide, Background };
