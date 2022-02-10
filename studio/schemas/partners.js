const partner = {
  name: "partner",
  title: "Partners",
  type: "document",
  fields:[
    {
      title: "Partner Name",
      name: "name",
      type: "string",
    },
    {
      title: "Description",
      name: "description",
      type: "text",
    },
    {
      title: "Icon Logo",
      name: "logo",
      type: "seo_image",
    },
    {
      title: "Icon Light Logo",
      name: "logo_light",
      type: "seo_image",
    },
    {
      title: "Website",
      name: "url",
      type: "string",
    },
    {
      title: "Active",
      name: "active",
      type: "boolean",
    },
  ],
  preview:{
    select:{
      title: 'name',
      media: 'logo'
    }
  }
}

export default partner