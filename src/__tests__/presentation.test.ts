import { describe, it, expect } from "vitest";
import {
  createPresentation,
  updatePresentationName,
  savePresentation,
  loadPresentation,
} from "../functions/presentation.js";
import { addSlide } from "../functions/slide.js";
import type { Presentation } from "../types/presentation.js";

function createTestPresentation(): Presentation {
  return {
    id: "presentation-1",
    name: "Учебная презентация",
    slides: [
      {
        id: "slide-1",
        name: "Первый слайд",
        background: {
          type: "gradient",
          colors: ["#ff0000", "#0000ff"],
          angle: 45,
        },
        objects: [
          {
            id: "text-1",
            type: "TextObject",
            text: 'Текст с "кавычками"\nи переносом строки',
            x: 10,
            y: 20,
            width: 300,
            height: 80,
            fontFamily: "Arial",
            fontSize: 24,
            fontColor: "#112233",
          },
          {
            id: "image-1",
            type: "ImageObject",
            imageUrl: "images/photo.png",
            x: 40,
            y: 100,
            width: 200,
            height: 150,
          },
        ],
      },
      {
        id: "slide-2",
        name: "Второй слайд",
        background: { type: "image", imageUrl: "images/background.png" },
        objects: [],
      },
    ],
  };
}

describe("createPresentation", () => {
  it("создаёт презентацию с переданным названием", () => {
    const presentation = createPresentation("Моя презентация");
    expect(presentation.name).toBe("Моя презентация");
    expect(typeof presentation.id).toBe("string");
    expect(presentation.id).not.toBe("");
    expect(presentation.slides.length).toBe(1);
    expect(typeof presentation.slides[0]?.id).toBe("string");
    expect(presentation.slides[0]?.id).not.toBe("");
    expect(presentation.slides[0]?.id).not.toBe(presentation.id);
    expect(presentation.slides[0]?.name).toBe("Слайд 1");
    expect(presentation.slides[0]?.background).toEqual({
      type: "color",
      color: "#ffffff",
    });
    expect(presentation.slides[0]?.objects).toEqual([]);
  });
  it("создаёт независимые презентации", () => {
    const first = createPresentation("Моя презентация");
    const before = JSON.stringify(first);
    const second = createPresentation("Моя презентация");
    expect(first.id).not.toBe(second.id);
    expect(first.slides[0]?.id).not.toBe(second.slides[0]?.id);
    expect(first.slides).not.toBe(second.slides);
    expect(first.slides[0]).not.toBe(second.slides[0]);
    expect(first.slides[0]?.background).not.toBe(second.slides[0]?.background);
    expect(first.slides[0]?.objects).not.toBe(second.slides[0]?.objects);
    expect(JSON.stringify(first)).toBe(before);
  });
});

describe("updatePresentationName", () => {
  it("изменяет название, сохраняя исходную презентацию", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const updated = updatePresentationName(original, "Новое название");
    expect(updated).not.toBe(original);
    expect(updated.name).toBe("Новое название");
    expect(updated.id).toBe(original.id);
    expect(updated.slides).toEqual(original.slides);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("позволяет установить пустое название", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const updated = updatePresentationName(original, "");
    expect(updated).not.toBe(original);
    expect(updated).toEqual({ ...original, name: "" });
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("savePresentation", () => {
  it("сохраняет все данные презентации в JSON без изменения исходных данных", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const json = savePresentation(original);
    expect(typeof json).toBe("string");
    expect(JSON.parse(json)).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("сохраняет презентацию без слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const before = JSON.stringify(original);
    const json = savePresentation(original);
    expect(JSON.parse(json)).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("loadPresentation", () => {
  it("загружает фон, текст и изображения из JSON", () => {
    const original = createTestPresentation();
    const json = JSON.stringify(original);
    const loaded = loadPresentation(json);
    expect(loaded).toEqual(original);
    expect(loaded).not.toBe(original);
    expect(loaded.slides).not.toBe(original.slides);
    expect(loaded.slides[0]?.background).not.toBe(
      original.slides[0]?.background,
    );
    expect(loaded.slides[0]?.objects).not.toBe(original.slides[0]?.objects);
    expect(JSON.stringify(original)).toBe(json);
  });

  it("загружает презентацию без слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const json = JSON.stringify(original);
    const loaded = loadPresentation(json);
    expect(loaded).toEqual(original);
    expect(loaded.slides).not.toBe(original.slides);
    expect(JSON.stringify(original)).toBe(json);
  });

  it("восстанавливает презентацию после сохранения без потери данных", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const loaded = loadPresentation(savePresentation(original));
    expect(loaded).toEqual(original);
    expect(loaded).not.toBe(original);
    expect(loaded.slides).not.toBe(original.slides);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("выбрасывает SyntaxError при некорректном JSON", () => {
    expect(() => loadPresentation("{invalid json}")).toThrow(SyntaxError);
  });
});

describe("addSlide", () => {
  it("добавляет слайд с переданным именем в конец списка", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const updated = addSlide(original, "Заключение");
    const newSlide = updated.slides[original.slides.length];
    expect(updated).not.toBe(original);
    expect(updated.slides).not.toBe(original.slides);
    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe(original.name);
    expect(updated.slides.length).toBe(3);
    expect(updated.slides.slice(0, original.slides.length)).toEqual(
      original.slides,
    );
    expect(typeof newSlide?.id).toBe("string");
    expect(newSlide?.id).not.toBe("");
    expect(original.slides.some((slide) => slide.id === newSlide?.id)).toBe(
      false,
    );
    expect(newSlide?.name).toBe("Заключение");
    expect(newSlide?.background).toEqual({ type: "color", color: "#ffffff" });
    expect(newSlide?.objects).toEqual([]);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("задаёт имя по количеству существующих слайдов, если имя не передано", () => {
    const original = createTestPresentation();
    const before = JSON.stringify(original);
    const updated = addSlide(original);
    expect(updated).not.toBe(original);
    expect(updated.slides).not.toBe(original.slides);
    expect(updated.slides.length).toBe(3);
    expect(updated.slides[2]?.name).toBe("Слайд 3");
    expect(updated.slides.slice(0, 2)).toEqual(original.slides);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("добавляет первый слайд в презентацию с пустым списком слайдов", () => {
    const original = { ...createTestPresentation(), slides: [] };
    const before = JSON.stringify(original);
    const updated = addSlide(original);
    expect(updated).not.toBe(original);
    expect(updated.slides).not.toBe(original.slides);
    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe(original.name);
    expect(updated.slides.length).toBe(1);
    expect(updated.slides[0]?.name).toBe("Слайд 1");
    expect(updated.slides[0]?.background).toEqual({
      type: "color",
      color: "#ffffff",
    });
    expect(updated.slides[0]?.objects).toEqual([]);
    expect(JSON.stringify(original)).toBe(before);
  });
});
