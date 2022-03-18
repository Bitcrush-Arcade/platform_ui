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
      type: "string",
      validation: Rule => Rule.required()
    },
    {
      title: "Main Token",
      name: "mainToken",
      type: "string"
    },
    {
      title: "Main Token Image",
      name: "MainTokenImage",
      type: "seo_image"
    },
    {
      title: "Base Token",
      name: "baseToken",
      type: "string"
    },
    {
      title: "Base Token Image",
      name: "baseTokenImage",
      type: "seo_image"
    },
    {
      title: "Swap",
      name: "swap",
      type: "string"
    },
    {
      title: "Swap Image",
      name: "swapImage",
      type: "seo_image"
    },

  ],
  preview: {
    select: {
      title: 'pid',
      subtitle: 'poolName',
      media: 'mainTokenenIcon'
    },
  }
}

export default poolAssets