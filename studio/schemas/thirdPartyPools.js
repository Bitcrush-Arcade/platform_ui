const pools = {
  name: "tp_pool",
  title: "Third Party Pools",
  type: "document",
  groups: [
    {
      name: "chainInfo",
      title: "Chain Info"
    },
  ],
  fields: [

    {
      title: "Pool Contract",
      name: "contract",
      type: "string",
    },
    {
      title: "Reward Token",
      name: "rewardToken",
      type: "reference",
      to: [{ type: "token" }],
    },
    {
      title: "Stake Token",
      name: "stakeToken",
      type: "reference",
      to: [{ type: "token" }],
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
      title: "Active",
      name: "active",
      type: "boolean"
    },
    {
      title: "Hidden",
      name: "hidden",
      type: "boolean"
    },
    {
      title: "Tags",
      name: "tags",
      type: "array",
      of: [{ type: 'string' }]
    },

  ],

  preview: {
    select: {
      title: 'rewardToken.symbol',
      subtitle: 'stakeToken.symbol',

    },
  },
  initialValue: {
    color: true
  }
}

export default pools