import type { TextObject, ImageObject, SlideObject } from "../types/objects.js";
import type { Slide } from "../types/slide.js";
import { generateId } from "./presentation.js";

function addTextObject(
  slide: Slide,
  content: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontFamily: string,
  fontSize: number,
  fontColor: string,
): Slide {
  return {
    ...slide,
    objects: [
      ...slide.objects,
      {
        id: generateId(),
        type: "TextObject",
        text: content,
        x,
        y,
        width,
        height,
        fontFamily,
        fontSize,
        fontColor,
      },
    ],
  };
}

function addImageObject(
  slide: Slide,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Slide {
  return {
    ...slide,
    objects: [
      ...slide.objects,
      { id: generateId(), type: "ImageObject", imageUrl, x, y, width, height },
    ],
  };
}

function removeObject(slide: Slide, objectId: string): Slide {
  const updateObjects = slide.objects.filter(
    (object) => object.id !== objectId,
  );
  return { ...slide, objects: updateObjects };
}

function updateObjectById(
  slide: Slide,
  objectId: string,
  update: (object: SlideObject) => SlideObject,
): Slide {
  const currentIndex = slide.objects.findIndex(
    (object) => object.id === objectId,
  );
  if (currentIndex === -1) {
    return slide;
  }
  const object = slide.objects[currentIndex];
  if (object === undefined) {
    return slide;
  }
  const updatedObject = update(object);
  if (updatedObject === object) {
    return slide;
  }
  const updatedObjects = [...slide.objects];
  updatedObjects[currentIndex] = updatedObject;
  return {
    ...slide,
    objects: updatedObjects,
  };
}

function moveObject(
  slide: Slide,
  objectId: string,
  newX: number,
  newY: number,
): Slide {
  return updateObjectById(slide, objectId, (object) => ({
    ...object,
    x: newX,
    y: newY,
  }));
}

function resizeObject(
  slide: Slide,
  objectId: string,
  newWidth: number,
  newHeight: number,
): Slide {
  return updateObjectById(slide, objectId, (object) => ({
    ...object,
    width: newWidth,
    height: newHeight,
  }));
}

function updateTextObjectStyle(
  slide: Slide,
  objectId: string,
  fontFamily: string,
  fontSize: number,
  fontColor: string,
): Slide {
  return updateObjectById(slide, objectId, (object) => {
    if (object.type !== "TextObject") {
      return object;
    }
    return {
      ...object,
      fontFamily,
      fontColor,
      fontSize,
    };
  });
}

export {
  addTextObject,
  addImageObject,
  removeObject,
  moveObject,
  resizeObject,
  updateTextObjectStyle,
};
