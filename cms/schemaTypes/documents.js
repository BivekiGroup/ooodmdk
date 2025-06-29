export default {
  name: 'documents',
  title: 'Документ',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название документа',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Описание',
      type: 'text',
    },
    {
      name: 'file',
      title: 'Файл',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx',
      },
    },
    {
      name: 'icon',
      title: 'Иконка',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}
