import {
  createClient,
  createPortableTextComponent,
  createImageUrlBuilder,
  createPreviewSubscriptionHook
} from 'next-sanity'

import { config } from 'utils/cmsConfig'

if(!config.projectId){
  throw Error(
    "The ProjectId is not set. Check your env variables"
  );
};

export const urlFor = source =>
  createImageUrlBuilder(config).image(source);

export const imageBuilder = source =>
  createImageUrlBuilder(config).image(source);

export const usePreviewSubscription =
  createPreviewSubscriptionHook(config);
  
// TODO
// Set up Portable Text serialization
export const PortableText = createPortableTextComponent({
  ...config,
  // Serializers passed to @sanity/block-content-to-react
  // (https://github.com/sanity-io/block-content-to-react)
  serializers: {
    types: {
      code: props => (
        <pre data-language={props.node.language}>
          <code>{props.node.code}</code>
        </pre>
      )
    },
  }
});

export const client = createClient(config);

export const previewClient = createClient({
  ...config,
  useCdn: false
});

export const getClient = usePreview =>
  usePreview ? previewClient : client;
export default client;