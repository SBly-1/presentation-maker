import type { Slide } from "../types/slide.js";
import type { Presentation } from "../types/presentation.js";
import { createDefaultSlide, generateId } from "./presentation.js";

function addSlide(
  presentation: Presentation,
  slideName?: string,
): Presentation {
  const newSlide = createDefaultSlide(
    slideName || `Слайд ${presentation.slides.length + 1}`,
  );
  return {
    ...presentation,
    slides: [...presentation.slides, newSlide],
  };
}

function removeSlides(
  presentation: Presentation,
  slideIds: string[],
): Presentation {
  const updatedSlides = presentation.slides.filter(
    (slide) => !slideIds.includes(slide.id),
  );
  return {
    ...presentation,
    slides: updatedSlides,
  };
}

function moveSlide(
  presentation: Presentation,
  slideId: string,
  newIndex: number,
): Presentation {
  const currentIndex = presentation.slides.findIndex(
    (slide) => slide.id === slideId,
  );
  if (
    currentIndex === -1 ||
    !Number.isInteger(newIndex) ||
    newIndex < 0 ||
    newIndex > presentation.slides.length - 1 ||
    currentIndex === newIndex
  ) {
    return presentation;
  }
  const updatedSlides = [...presentation.slides];
  const slide = updatedSlides.splice(currentIndex, 1)[0];
  if (slide === undefined) {
    return presentation;
  }
  updatedSlides.splice(newIndex, 0, slide);
  return {
    ...presentation,
    slides: updatedSlides,
  };
}

function duplicateSlide(
  presentation: Presentation,
  slideId: string,
): Presentation {
  const currentIndex = presentation.slides.findIndex(
    (slide) => slide.id === slideId,
  );
  if (currentIndex === -1) {
    return presentation;
  }
  const slide = presentation.slides[currentIndex];
  if (slide === undefined) {
    return presentation;
  }
  const newSlide = {
    ...slide,
    id: generateId(),
    name: `${slide.name} (копия)`,
    background:
      slide.background.type === "gradient"
        ? { ...slide.background, colors: [...slide.background.colors] }
        : { ...slide.background },
    objects: slide.objects.map((object) => ({ ...object, id: generateId() })),
  };
  const updatedSlides = [...presentation.slides];
  updatedSlides.splice(currentIndex + 1, 0, newSlide);
  return {
    ...presentation,
    slides: updatedSlides,
  };
}

function setSlideBackgroundColor(slide: Slide, color: string): Slide {
  return {
    ...slide,
    background: { type: "color", color },
  };
}

function setSlideBackgroundImage(slide: Slide, imageUrl: string): Slide {
  return {
    ...slide,
    background: { type: "image", imageUrl },
  };
}

function setSlideBackgroundGradient(
  slide: Slide,
  colors: string[],
  angle?: number,
): Slide {
  angle === undefined ? (angle = 0) : angle;
  return {
    ...slide,
    background: { type: "gradient", colors: [...colors], angle },
  };
}

function clearSlideBackground(slide: Slide): Slide {
  return setSlideBackgroundColor(slide, "#ffffff");
}
export {
  addSlide,
  removeSlides,
  moveSlide,
  duplicateSlide,
  setSlideBackgroundColor,
  setSlideBackgroundImage,
  setSlideBackgroundGradient,
  clearSlideBackground,
};
