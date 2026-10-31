import { describe, it, expect, vi } from "vitest";
import {
  addTextObject,
  addImageObject,
  removeObject,
  moveObject,
  resizeObject,
  updateTextObjectStyle,
} from "../functions/objects.js";
import type { Slide } from "../types/slide.js";

function createTestSlide(): Slide {
  return {
    id: "slide-1",
    name: "Тестовый слайд",
    background: {
      type: "gradient",
      colors: ["#ff0000", "#0000ff"],
      angle: 45,
    },
    objects: [
      {
        id: "object-1",
        type: "TextObject",
        text: "Первый текст",
        x: 10,
        y: 20,
        width: 300,
        height: 80,
        fontFamily: "Arial",
        fontSize: 24,
        fontColor: "#112233",
      },
      {
        id: "object-10",
        type: "ImageObject",
        imageUrl: "images/photo.png",
        x: 40,
        y: 100,
        width: 200,
        height: 150,
      },
      {
        id: "object-2",
        type: "TextObject",
        text: "Второй текст",
        x: 50,
        y: 60,
        width: 120,
        height: 40,
        fontFamily: "Verdana",
        fontSize: 16,
        fontColor: "#445566",
      },
    ],
  };
}

describe("addTextObject", () => {
  it.each([true, false])(
    "добавляет текст в конец списка (список пуст: %s)",
    (empty) => {
      const original = createTestSlide();
      if (empty) {
        original.objects = [];
      }
      const before = JSON.stringify(original);
      const content = 'Новый текст с "кавычками"\nи переносом строки';
      const updated = addTextObject(
        original,
        content,
        15,
        25,
        320,
        90,
        "Georgia",
        28,
        "#abcdef",
      );
      const newObject = updated.objects[original.objects.length];
      expect(updated).not.toBe(original);
      expect(updated.objects).not.toBe(original.objects);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.background).toEqual(original.background);
      expect(updated.objects.length).toBe(original.objects.length + 1);
      expect(updated.objects.slice(0, original.objects.length)).toEqual(
        original.objects,
      );
      expect(typeof newObject?.id).toBe("string");
      expect(newObject?.id).not.toBe("");
      expect(
        original.objects.some((object) => object.id === newObject?.id),
      ).toBe(false);
      expect(newObject).toEqual({
        id: newObject?.id,
        type: "TextObject",
        text: content,
        x: 15,
        y: 25,
        width: 320,
        height: 90,
        fontFamily: "Georgia",
        fontSize: 28,
        fontColor: "#abcdef",
      });
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("создаёт отдельный текстовый объект с новым ID при каждом вызове", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    const first = addTextObject(
      original,
      "Текст",
      0,
      0,
      100,
      50,
      "Arial",
      20,
      "#000000",
    );
    const second = addTextObject(
      original,
      "Текст",
      0,
      0,
      100,
      50,
      "Arial",
      20,
      "#000000",
    );
    const index = original.objects.length;
    expect(first.objects[index]?.id).not.toBe(second.objects[index]?.id);
    expect(first.objects[index]).not.toBe(second.objects[index]);
    expect(first.objects).not.toBe(second.objects);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("addImageObject", () => {
  it.each([true, false])(
    "добавляет изображение в конец списка (список пуст: %s)",
    (empty) => {
      const original = createTestSlide();
      if (empty) {
        original.objects = [];
      }
      const before = JSON.stringify(original);
      const updated = addImageObject(
        original,
        "images/new-photo.png",
        15,
        25,
        320,
        180,
      );
      const newObject = updated.objects[original.objects.length];
      expect(updated).not.toBe(original);
      expect(updated.objects).not.toBe(original.objects);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.background).toEqual(original.background);
      expect(updated.objects.length).toBe(original.objects.length + 1);
      expect(updated.objects.slice(0, original.objects.length)).toEqual(
        original.objects,
      );
      expect(typeof newObject?.id).toBe("string");
      expect(newObject?.id).not.toBe("");
      expect(
        original.objects.some((object) => object.id === newObject?.id),
      ).toBe(false);
      expect(newObject).toEqual({
        id: newObject?.id,
        type: "ImageObject",
        imageUrl: "images/new-photo.png",
        x: 15,
        y: 25,
        width: 320,
        height: 180,
      });
      expect(JSON.stringify(original)).toBe(before);
    },
  );
  it("создаёт отдельное изображение с новым ID при каждом вызове", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    const first = addImageObject(original, "images/photo.png", 0, 0, 100, 50);
    const second = addImageObject(original, "images/photo.png", 0, 0, 100, 50);
    const index = original.objects.length;
    expect(first.objects[index]?.id).not.toBe(second.objects[index]?.id);
    expect(first.objects[index]).not.toBe(second.objects[index]);
    expect(first.objects).not.toBe(second.objects);
    expect(JSON.stringify(original)).toBe(before);
  });
});
describe("removeObject", () => {
  it.each([
    { objectId: "object-1", remainingIds: ["object-10", "object-2"] },
    { objectId: "object-10", remainingIds: ["object-1", "object-2"] },
    { objectId: "object-2", remainingIds: ["object-1", "object-10"] },
    {
      objectId: "object-100",
      remainingIds: ["object-1", "object-10", "object-2"],
    },
  ])(
    "удаляет только точное совпадение ID $objectId",
    ({ objectId, remainingIds }) => {
      const original = createTestSlide();
      const before = JSON.stringify(original);
      const updated = removeObject(original, objectId);
      expect(updated).not.toBe(original);
      expect(updated.objects).not.toBe(original.objects);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.background).toEqual(original.background);
      expect(updated.objects.map((object) => object.id)).toEqual(remainingIds);
      expect(updated.objects).toEqual(
        remainingIds.map((id) =>
          original.objects.find((object) => object.id === id),
        ),
      );
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("позволяет удалить последний объект", () => {
    const original = createTestSlide();
    original.objects = original.objects.slice(0, 1);
    const before = JSON.stringify(original);
    const updated = removeObject(original, "object-1");
    expect(updated).toEqual({ ...original, objects: [] });
    expect(JSON.stringify(original)).toBe(before);
  });

  it("обрабатывает пустой список объектов", () => {
    const original = { ...createTestSlide(), objects: [] };
    const before = JSON.stringify(original);
    expect(removeObject(original, "missing")).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("moveObject", () => {
  it.each([
    { label: "текст", objectId: "object-1", index: 0, newX: 100, newY: 200 },
    {
      label: "изображение",
      objectId: "object-10",
      index: 1,
      newX: 0,
      newY: -10.5,
    },
  ])(
    "перемещает $label, сохраняя содержимое, размеры и порядок",
    ({ objectId, index, newX, newY }) => {
      const original = createTestSlide();
      const before = JSON.stringify(original);
      const source = original.objects[index];
      const updated = moveObject(original, objectId, newX, newY);
      expect(updated).not.toBe(original);
      expect(updated.objects).not.toBe(original.objects);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.background).toEqual(original.background);
      expect(updated.objects.map((object) => object.id)).toEqual([
        "object-1",
        "object-10",
        "object-2",
      ]);
      expect(updated.objects[index]).not.toBe(source);
      expect(updated.objects[index]).toEqual({ ...source, x: newX, y: newY });
      expect(
        updated.objects.filter((object) => object.id !== objectId),
      ).toEqual(original.objects.filter((object) => object.id !== objectId));
      expect(JSON.stringify(original)).toBe(before);
    },
  );
  it("возвращает исходный слайд для неизвестного ID", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    expect(moveObject(original, "object-100", 10, 20)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходный слайд, если по найденному индексу нет объекта", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    const findIndex = vi
      .spyOn(original.objects, "findIndex")
      .mockReturnValueOnce(original.objects.length);
    try {
      expect(moveObject(original, "object-1", 100, 200)).toBe(original);
      expect(JSON.stringify(original)).toBe(before);
    } finally {
      findIndex.mockRestore();
    }
  });

  it("обрабатывает пустой список объектов", () => {
    const original = { ...createTestSlide(), objects: [] };
    const before = JSON.stringify(original);
    expect(moveObject(original, "missing", 10, 20)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("resizeObject", () => {
  it.each([
    {
      label: "текст",
      objectId: "object-1",
      index: 0,
      newWidth: 500,
      newHeight: 160,
    },
    {
      label: "изображение",
      objectId: "object-10",
      index: 1,
      newWidth: 50.5,
      newHeight: 25.5,
    },
  ])(
    "изменяет размеры объекта ($label), сохраняя остальные поля",
    ({ objectId, index, newWidth, newHeight }) => {
      const original = createTestSlide();
      const before = JSON.stringify(original);
      const source = original.objects[index];
      const updated = resizeObject(original, objectId, newWidth, newHeight);
      expect(updated).not.toBe(original);
      expect(updated.objects).not.toBe(original.objects);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.background).toEqual(original.background);
      expect(updated.objects.map((object) => object.id)).toEqual([
        "object-1",
        "object-10",
        "object-2",
      ]);
      expect(updated.objects[index]).not.toBe(source);
      expect(updated.objects[index]).toEqual({
        ...source,
        width: newWidth,
        height: newHeight,
      });
      expect(
        updated.objects.filter((object) => object.id !== objectId),
      ).toEqual(original.objects.filter((object) => object.id !== objectId));
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it("возвращает исходный слайд для неизвестного ID", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);

    expect(resizeObject(original, "object-100", 100, 50)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("обрабатывает пустой список объектов", () => {
    const original = { ...createTestSlide(), objects: [] };
    const before = JSON.stringify(original);

    expect(resizeObject(original, "missing", 100, 50)).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("updateTextObjectStyle", () => {
  it.each([
    { objectId: "object-1", index: 0 },
    { objectId: "object-2", index: 2 },
  ])("обновляет только оформление текста $objectId", ({ objectId, index }) => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    const source = original.objects[index];
    const updated = updateTextObjectStyle(
      original,
      objectId,
      "Georgia",
      36,
      "#abcdef",
    );
    expect(updated).not.toBe(original);
    expect(updated.objects).not.toBe(original.objects);
    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe(original.name);
    expect(updated.background).toEqual(original.background);
    expect(updated.objects.map((object) => object.id)).toEqual([
      "object-1",
      "object-10",
      "object-2",
    ]);
    expect(updated.objects[index]).not.toBe(source);
    expect(updated.objects[index]).toEqual({
      ...source,
      fontFamily: "Georgia",
      fontSize: 36,
      fontColor: "#abcdef",
    });
    expect(updated.objects.filter((object) => object.id !== objectId)).toEqual(
      original.objects.filter((object) => object.id !== objectId),
    );
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходный слайд при переданном ID изображения", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    const updated = updateTextObjectStyle(
      original,
      "object-10",
      "Georgia",
      36,
      "#abcdef",
    );
    expect(updated).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("возвращает исходный слайд для неизвестного ID", () => {
    const original = createTestSlide();
    const before = JSON.stringify(original);
    expect(
      updateTextObjectStyle(original, "object-100", "Georgia", 36, "#abcdef"),
    ).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("обрабатывает пустой список объектов", () => {
    const original = { ...createTestSlide(), objects: [] };
    const before = JSON.stringify(original);
    expect(
      updateTextObjectStyle(original, "missing", "Georgia", 36, "#abcdef"),
    ).toBe(original);
    expect(JSON.stringify(original)).toBe(before);
  });
});
