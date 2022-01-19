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
  ],
  preview:{
    select:{
      title: 'tokenName.symbol',
      subtitle: 'status',
      media: 'tokenName.tokenIcon'
    },
    prepare({ title, subtitle, media }){
      return{
        title,
        subtitle: subtitle ? 'On' : "Off",
        media,
      }
    }
  }
}

export default liveWallet