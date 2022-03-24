

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
      title: "Pool Identifier",
      name: "pid",
      type: "number",
      validation: Rule => Rule.integer().positive().min(1)
    },
    {
      title: "Main Token",
      name: "mainToken",
      type: "reference",
      to: [{ type: "token" }],
    },

    {
      title: "Base Token",
      name: "baseToken",
      type: "reference",
      to: [{ type: "token" }],
    },
    {
      title: "Swap",
      name: "swapPartner",
      type: "reference",
      to: [{ type: "partner" }],
    },
    {
      title: "Display in farm, otherwise pool",
      name: "isFarm",
      type: "boolean"
    },
    {
      title: "Color scheme primary? otherwise secondary",
      name: "color",
      type: "boolean"
    },
    {
      title: "Highlight effect",
      name: "highlight",
      type: "boolean"
    },

  ],

  preview: {
    select: {
      title: 'poolName',
      subtitle: 'pid',

    },
  },
  initialValue: {
    color: true
  }
}

export default poolAssets