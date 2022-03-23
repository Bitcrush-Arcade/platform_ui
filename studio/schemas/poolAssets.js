

const poolAssets = {
  name: "poolAssets",
  title: "Pools",
  type: "document",
  groups: [
    {
      name: "chainInfo",
      title: "Chain Info"
    },
  ],
  fields: [

    {
      title: "Pool Name",
      name: "poolName",
      type: "string",
      validation: Rule => Rule.required()
    },
    {
      title: "Pool Identifier",
      name: "pid",
      type: "number",
      validation: Rule => Rule.integer().positive().min(1)
    },
    {
      title: "Main Token",
      name: "mainToken",
      type: "string"
    },
    {
      title: "Main Token Image",
      name: "mainTokenImage",
      type: "reference",
      to: [{ type: "token" }],
    },
    {
      title: "Base Token",
      name: "baseToken",
      type: "string"
    },
    {
      title: "Base Token Image",
      name: "baseTokenImage",
      type: "reference",
      to: [{ type: "token" }],
    },
    {
      title: "Swap",
      name: "swap",
      type: "string"
    },
    {
      title: "Swap Image",
      name: "swapPartner",
      type: "reference",
      to: [{ type: "partner" }],
    },

  ],

  preview: {
    select: {
      title: 'poolName',
      subtitle: 'pid',

    },
  }
}

export default poolAssets