import { describe, it, expect, vi } from "vitest";
import {
  removeSlides,
  moveSlide,
  duplicateSlide,
  setSlideBackgroundColor,
  setSlideBackgroundImage,
  setSlideBackgroundGradient,
  clearSlideBackground,
} from "../functions/slide.js";
import type { Presentation } from "../types/presentation.js";
import type { Slide, Background } from "../types/slide.js";

function createTestSlide(
  id: string,
  background: Background = { type: "color", color: "#ffffff" },
): Slide {
  return {
    id,
    name: `Слайд ${id}`,
    background: structuredClone(background),
    objects: [
      {
        id: `${id}-text`,
        type: "TextObject",
        text: "Текст на слайде",
        x: 10,
        y: 20,
        width: 300,
        height: 80,
        fontFamily: "Arial",
        fontSize: 24,
        fontColor: "#112233",
      },
      {
        id: `${id}-image`,
        type: "ImageObject",
        imageUrl: "images/photo.png",
        x: 40,
        y: 100,
        width: 200,
        height: 150,
      },
    ],
  };
}

function createTestPresentation(): Presentation {
  return {
    id: "presentation-1",
    name: "Учебная презентация",
    slides: [
      createTestSlide("slide-1"),
      createTestSlide("slide-10", {
        type: "image",
        imageUrl: "images/background.png",
      }),
      createTestSlide("slide-3", {
        type: "gradient",
        colors: ["#ff0000", "#0000ff"],
        angle: 45,
      }),
    ],
  };
}

const backgrounds: Background[] = [
  { type: "color", color: "#123456" },
  { type: "image", imageUrl: "images/background.png" },
  { type: "gradient", colors: ["#ff0000", "#0000ff"], angle: 45 },
];

describe("removeSlides", () => {
  it.each([
    {
      label: "один слайд с точным совпадением ID",
      slideIds: ["slide-1"],
      remainingIds: ["slide-10", "slide-3"],
    },
    {
      label: "несколько слайдов",
      slideIds: ["slide-1", "slide-3"],
      remainingIds: ["slide-10"],
    },
    {
      label: "все слайды",
      slideIds: ["slide-1", "slide-10", "slide-3"],
      remainingIds: [],
    },
    {
      label: "пустой список ID",
      slideIds: [],
      remainingIds: ["slide-1", "slide-10", "slide-3"],
    },
    {
      label: "неизвестный ID",
      slideIds: ["slide-100"],
      remainingIds: ["slide-1", "slide-10", "slide-3"],
    },
    {
      label: "повторяющиеся и неизвестные ID",
      slideIds: ["slide-10", "slide-10", "missing"],
      remainingIds: ["slide-1", "slide-3"],
    },
  ])(
    "обрабатывает $label, сохраняя порядок и исходные данные",
    ({ slideIds, remainingIds }) => {
      const original = createTestPresentation();
      const before = JSON.stringify(original);
      const idsBefore = [...slideIds];
      const updated = removeSlides(original, slideIds);
      expect(updated).not.toBe(original);
      expect(updated.slides).not.toBe(original.slides);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.slides.map((slide) => slide.id)).toEqual(remainingIds);
      expect(updated.slides).toEqual(
        remainingIds.map((id) =>
          original.slides.find((slide) => slide.id === id),
        ),
      );
      expect(JSON.stringify(original)).toBe(before);
      expect(slideIds).toEqual(idsBefore);
    },
  );

  it("обрабатывает презентацию без слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const before = JSON.stringify(original);
    const slideIds = ["missing"];
    const updated = removeSlides(original, slideIds);
    expect(updated).toEqual(original);
    expect(updated.slides).toEqual([]);
    expect(JSON.stringify(original)).toBe(before);
    expect(slideIds).toEqual(["missing"]);
  });
});

describe("moveSlide", () => {
  it.each([
    {
      label: "в начало",
      slideId: "slide-3",
      newIndex: 0,
      expectedIds: ["slide-3", "slide-1", "slide-10"],
    },
    {
      label: "в конец",
      slideId: "slide-1",
      newIndex: 2,
      expectedIds: ["slide-10", "slide-3", "slide-1"],
    },
    {
      label: "в середину из конца",
      slideId: "slide-3",
      newIndex: 1,
      expectedIds: ["slide-1", "slide-3", "slide-10"],
    },
    {
      label: "в середину из начала",
      slideId: "slide-1",
      newIndex: 1,
      expectedIds: ["slide-10", "slide-1", "slide-3"],
    },
  ])(
    "перемещает слайд $label без изменения исходной презентации",
    ({ slideId, newIndex, expectedIds }) => {
      const original = createTestPresentation();
      const before = JSON.stringify(original);
      const updated = moveSlide(original, slideId, newIndex);
      expect(updated).not.toBe(original);
      expect(updated.slides).not.toBe(original.slides);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.slides.map((slide) => slide.id)).toEqual(expectedIds);
      expect(updated.slides).toEqual(
        expectedIds.map((id) =>
          original.slides.find((slide) => slide.id === id),
        ),
      );
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("сохраняет порядок при перемещении на текущую позицию", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const updated = moveSlide(original, "slide-10", 1);
    expect(updated).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it.each([-1, 3, 1.5, NaN, Infinity])(
    "возвращает исходную презентацию для некорректного индекса %s",
    (newIndex) => {
      const original = createTestPresentation();
      const before = JSON.stringify(original);
      const updated = moveSlide(original, "slide-10", newIndex);
      expect(updated).toBe(original);
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("возвращает исходную презентацию для неизвестного ID", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    expect(moveSlide(original, "slide-100", 0)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходную презентацию, если по найденному индексу нет слайда", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const findIndex = vi
      .spyOn(original.slides, "findIndex")
      .mockReturnValueOnce(original.slides.length);
    try {
      expect(moveSlide(original, "slide-1", 0)).toBe(original);
      expect(JSON.stringify(original)).toBe(before);
    } finally {
      findIndex.mockRestore();
    }
  });

  it("обрабатывает презентацию без слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const before = JSON.stringify(original);
    expect(moveSlide(original, "missing", 0)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("duplicateSlide", () => {
  it.each([
    { label: "первый с цветным фоном", slideId: "slide-1", index: 0 },
    { label: "средний с изображением на фоне", slideId: "slide-10", index: 1 },
    { label: "последний с градиентом", slideId: "slide-3", index: 2 },
  ])(
    "дублирует $label слайд и создаёт независимую копию",
    ({ slideId, index }) => {
      const original = createTestPresentation();
      const before = JSON.stringify(original);
      const source = original.slides[index];
      const updated = duplicateSlide(original, slideId);
      const copy = updated.slides[index + 1];
      if (source === undefined || copy === undefined) {
        throw new Error("Оригинал или копия слайда отсутствует");
      }
      expect(updated).not.toBe(original);
      expect(updated.slides).not.toBe(original.slides);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.slides.length).toBe(original.slides.length + 1);
      expect(updated.slides.slice(0, index + 1)).toEqual(
        original.slides.slice(0, index + 1),
      );
      expect(updated.slides.slice(index + 2)).toEqual(
        original.slides.slice(index + 1),
      );
      expect(copy).not.toBe(source);
      expect(copy.name).toBe(`${source.name} (копия)`);
      expect(copy.background).toEqual(source.background);
      expect(copy.background).not.toBe(source.background);
      expect(copy.objects).not.toBe(source.objects);
      expect(copy.objects.length).toBe(source.objects.length);
      const originalIds = [
        original.id,
        ...original.slides.flatMap((slide) => [
          slide.id,
          ...slide.objects.map((object) => object.id),
        ]),
      ];
      const copyIds = [copy.id, ...copy.objects.map((object) => object.id)];
      for (const id of copyIds) {
        expect(typeof id).toBe("string");
        expect(id).not.toBe("");
        expect(originalIds).not.toContain(id);
      }
      expect(new Set(copyIds).size).toBe(copyIds.length);
      for (const [objectIndex, sourceObject] of source.objects.entries()) {
        const copiedObject = copy.objects[objectIndex];
        expect(copiedObject).not.toBe(sourceObject);
        expect(copiedObject).toEqual({ ...sourceObject, id: copiedObject?.id });
      }
      if (
        copy.background.type === "gradient" &&
        source.background.type === "gradient"
      ) {
        expect(copy.background.colors).not.toBe(source.background.colors);
        copy.background.colors[0] = "#00ff00";
      } else if (copy.background.type === "color") {
        copy.background.color = "#00ff00";
      } else if (copy.background.type === "image") {
        copy.background.imageUrl = "images/changed.png";
      }
      const copiedObject = copy.objects[0];
      if (copiedObject !== undefined) {
        copiedObject.x = 999;
      }
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("дублирует слайд с пустым массивом объектов", () => {
    const original = createTestPresentation();
    original.slides = [createTestSlide("empty")];
    const source = original.slides[0];
    if (source === undefined) {
      throw new Error("Тестовый слайд отсутствует");
    }
    source.objects = [];
    const before = JSON.stringify(original);
    const updated = duplicateSlide(original, source.id);
    expect(updated.slides.length).toBe(2);
    expect(updated.slides[0]).toEqual(source);
    expect(updated.slides[1]?.id).not.toBe(source.id);
    expect(updated.slides[1]?.objects).toEqual([]);
    expect(updated.slides[1]?.objects).not.toBe(source.objects);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходную презентацию для неизвестного ID", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    expect(duplicateSlide(original, "slide-100")).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходную презентацию, если по найденному индексу нет слайда", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const findIndex = vi
      .spyOn(original.slides, "findIndex")
      .mockReturnValueOnce(original.slides.length);
    try {
      expect(duplicateSlide(original, "slide-1")).toBe(original);
      expect(JSON.stringify(original)).toBe(before);
    } finally {
      findIndex.mockRestore();
    }
  });

  it("обрабатывает презентацию без слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const before = JSON.stringify(original);
    expect(duplicateSlide(original, "missing")).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("setSlideBackgroundColor", () => {
  it.each(backgrounds)("заменяет фон $type на цвет", (background) => {
    const original = createTestSlide("slide-1", background);
    const before = JSON.stringify(original);
    const updated = setSlideBackgroundColor(original, "#00ff00");
    expect(updated).not.toBe(original);
    expect(updated).toEqual({
      ...original,
      background: { type: "color", color: "#00ff00" },
    });
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("setSlideBackgroundImage", () => {
  it.each(backgrounds)("заменяет фон $type на изображение", (background) => {
    const original = createTestSlide("slide-1", background);
    const before = JSON.stringify(original);
    const updated = setSlideBackgroundImage(
      original,
      "images/new-background.png",
    );
    expect(updated).not.toBe(original);
    expect(updated).toEqual({
      ...original,
      background: { type: "image", imageUrl: "images/new-background.png" },
    });
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("setSlideBackgroundGradient", () => {
  it.each([
    { label: "по умолчанию", angle: undefined, expectedAngle: 0 },
    { label: "нулевой", angle: 0, expectedAngle: 0 },
    { label: "переданный", angle: 45, expectedAngle: 45 },
  ])("устанавливает градиент и $label угол", ({ angle, expectedAngle }) => {
    const original = createTestSlide("slide-1", {
      type: "image",
      imageUrl: "images/background.png",
    });
    const before = JSON.stringify(original);
    const colors = ["#ff0000", "#00ff00", "#0000ff"];
    const colorsBefore = [...colors];
    const updated = setSlideBackgroundGradient(original, colors, angle);
    expect(updated).not.toBe(original);
    expect(updated).toEqual({
      ...original,
      background: {
        type: "gradient",
        colors: colorsBefore,
        angle: expectedAngle,
      },
    });
    expect(JSON.stringify(original)).toBe(before);
    expect(colors).toEqual(colorsBefore);
  });

  it("создаёт независимый массив цветов", () => {
    const original = createTestSlide("slide-1");
    const before = JSON.stringify(original);
    const colors = ["#ff0000", "#0000ff"];
    const colorsBefore = [...colors];
    const updated = setSlideBackgroundGradient(original, colors, 90);
    if (updated.background.type !== "gradient") {
      throw new Error("Ожидался градиентный фон");
    }
    expect(updated.background.colors).not.toBe(colors);
    expect(updated.background.colors).toEqual(colorsBefore);
    updated.background.colors[0] = "#00ff00";
    expect(colors).toEqual(colorsBefore);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("clearSlideBackground", () => {
  it.each(backgrounds)("сбрасывает фон $type в белый цвет", (background) => {
    const original = createTestSlide("slide-1", background);
    const before = JSON.stringify(original);
    const updated = clearSlideBackground(original);
    expect(updated).not.toBe(original);
    expect(updated).toEqual({
      ...original,
      background: { type: "color", color: "#ffffff" },
    });
    expect(JSON.stringify(original)).toBe(before);
  });
});
