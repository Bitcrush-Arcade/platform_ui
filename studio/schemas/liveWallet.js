const liveWallet = {
  name: "liveWallet",
  title: "Live Wallets",
  type: "document",
  fields:[
    {
      title: "Wallet Icon",
      name: "walletIcon",
      type: "seo_image",
    },
    {
      title: "Token",
      name: "tokenName",
      type: "reference",
      to: [{type: "token"}],
      validation: Rule => Rule.required(),
    },
    {
      title: "Contract Info",
      name: "walletContract",
      type: "contract"
    },
    {
      title: "Status",
      name: "status",
      type: "boolean"
    }
  ]
}

export default liveWallet