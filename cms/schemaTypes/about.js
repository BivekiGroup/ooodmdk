export default {
  name: 'about',
  title: 'О нас',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      initialValue: 'О НАС',
    },
    {
      name: 'paragraph1',
      title: 'Абзац 1',
      type: 'string',
    },
    {
      name: 'paragraph2',
      title: 'Абзац 2',
      type: 'string',
    },
    {
      name: 'paragraph3',
      title: 'Абзац 3',
      type: 'string',
    },
    {
      name: 'paragraph4',
      title: 'Абзац 4',
      type: 'string',
    },
    {
      name: 'paragraph5',
      title: 'Абзац 5',
      type: 'string',
    },
    {
      name: 'paragraph6',
      title: 'Абзац 6',
      type: 'string',
    },
    {
      name: 'paragraph7',
      title: 'Абзац 7',
      type: 'string',
    },
    {
      name: 'paragraph8',
      title: 'Абзац 8',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Изображения',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true,
      },
    },
  ],
};
