export default {
  name: 'category',
  title: 'Категория',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Слаг',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'color',
      title: 'Цвет',
      type: 'string',
    },
    {
      name: 'elements',
      title: 'Элементы',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'element', title: 'Обозначение элемента', type: 'string'},
            {name: 'elementNumber', title: 'Номер элемента', type: 'number'},
          ],
        },
      ],
    },
    {
      name: 'order',
      title: 'Порядок отображения',
      type: 'number',
    },
  ],
}
