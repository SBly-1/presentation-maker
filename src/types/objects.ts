type BaseObject = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextObject = BaseObject & {
  type: "TextObject";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
};
type ImageObject = BaseObject & {
  type: "ImageObject";
  imageUrl: string;
};

type SlideObject = TextObject | ImageObject;

export type { TextObject, ImageObject, SlideObject };
