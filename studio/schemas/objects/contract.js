const contract = {
  title: "Contract",
  name: "contract",
  type: "object",
  fields:[
    {
      title: "Main Address",
      name: "mainAddress",
      type: "string"
    },
    {
      title: "Test Address",
      name: "testAddress",
      type: "string"
    },
    {
      title: "Main Chain ID",
      name: "mainChain",
      type: "number",
      validation: Rule => Rule.integer().positive().min(1)
    },
    {
      title: "Test Chain ID",
      name: "testChain",
      type: "number",
      validation: Rule => Rule.integer().positive().min(1)
    },
  ]
}

export default contract