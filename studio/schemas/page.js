const page = {
  title: "Pages",
  name: "web_page",
  type: "document",
  fields: [
    {
      title: "Page Name",
      name: 'page_name',
      type: 'string'
    },
    {
      title: "Website",
      name: 'url',
      type: 'string'
    },
    {
      title: "Whitepaper",
      name: 'whitepaper',
      type: 'file'
    },
  ]
}

export default page