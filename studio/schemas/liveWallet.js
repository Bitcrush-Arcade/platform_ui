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
      type: "string",
      validation: Rule => Rule.required(),
    },
    {
      title: "Contract Address",
      name: "contract",
      type: "string",
    },
    {
      title: "Status",
      name: "status",
      type: "boolean"
    }
  ]
}

export default liveWallet