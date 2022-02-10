const faq = {
  title: "FAQs",
  name: "faq",
  type: "document",
  fields:[
    {
      title: "Summary",
      name: "summary",
      type: "string"
    },
    {
      title: "Detail",
      name: "detail",
      type: "text"
    },
    {
      title: "Order",
      name: "order",
      type: 'number',
    },
    {
      title: "Associated Page",
      name: "webpage",
      type: "reference",
      to: [{type: 'web_page'}]
    },
  ]
}

export default faq