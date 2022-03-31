const token = {
  name: "token",
  title: "Token Info",
  type: "document",
  groups: [
    {
      name: "chainInfo",
      title: "Chain Info"
    },
  ],
  fields: [
    {
      title: "Token Icon",
      name: "tokenIcon",
      type: "seo_image"
    },
    {
      title: "Token Name",
      name: "name",
      type: "string",
      validation: Rule => Rule.required()
    },
    {
      title: "Token Symbol",
      name: "symbol",
      type: "string",
      validation: Rule => Rule.required()
    },
    {
      title: "Digits",
      name: "digits",
      type: "number",
      validation: Rule => Rule.integer().positive().min(0)
    },
    {
      title: "Contract Info",
      name: "tokenContract",
      type: "contract"
    },
    {
      title: "Project URL",
      name: "projectUrl",
      type: "string"
    },
  ],
  preview: {
    select: {
      title: 'symbol',
      subtitle: 'name',
      media: 'tokenIcon'
    },
  }
}

export default token