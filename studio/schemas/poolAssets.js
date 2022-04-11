

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
    {
      title: "Hidden",
      name: "hidden",
      type: "boolean"
    },

  ],

  preview: {
    select: {
      mainToken: 'mainToken.symbol',
      baseToken: 'baseToken.symbol',
      isFarm: 'isFarm',
      subtitle: 'pid',
    },
    prepare(selection)
    {
      const { mainToken, baseToken, subtitle, isFarm } = selection
      return {
        title: isFarm ? `${mainToken}-${baseToken}` : mainToken,
        subtitle
      }
    }
  },
  initialValue: {
    color: true
  },
  orderings: [
    {
      title: "Pool ID Asc",
      name: "poolIdAsc",
      by: [
        { field: "pid", direction: 'asc' }
      ]
    }
  ]
}

export default poolAssets