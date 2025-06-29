export default {
  name: 'product',
  title: 'Продукт',
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
      name: 'descriptions',
      title: 'Описание',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'description',
      title: 'Описание',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Изображение',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'category',
      title: 'Категория',
      type: 'reference',
      to: {type: 'category'},
    },
    {
      name: 'items',
      title: 'Итемы',
      type: 'array',
      of: [{type: 'string'}],
    },
  ],
}
