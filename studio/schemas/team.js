const team = {
  name:"team",
  title: "Team",
  type: "document",
  fields:[
    {
      title: "Avatar",
      name: "avatar",
      type: "seo_image",
    },
    {
      title: "Name",
      name: "name",
      type: "string",
    },
    {
      title: "Title",
      name: "title",
      type: "string",
    },
    {
      title: "Order",
      name: "order",
      type: "number"
    }
  ],
  preview:{
    select:{
      title: 'name',
      subtitle: 'title',
      media: 'avatar'
    }
  }
}

export default team