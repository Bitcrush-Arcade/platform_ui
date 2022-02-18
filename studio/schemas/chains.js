const chains = {
  name: "chain",
  title: "Bridge Chains",
  type: "document",
  fields:[
    {
      title: "Chain Logo",
      name: "chainIcon",
      type: "seo_image",
    },
    {
      title: "Chain Name",
      name: "chainName",
      type: "string"
    },
    {
      title: "Chain Symbol",
      name: "symbol",
      type: "string"
    },
    {
      title: "Chain Id",
      name: "chainId",
      type: "number"
    },
    {
      title: "Bridge Active",
      name: "active",
      type: "boolean"
    }
  ]
}

export default chains