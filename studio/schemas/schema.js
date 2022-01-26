// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'
// DOCUMENTS
import liveWallet from './liveWallet'
import bep20 from './BEP20'
import team from './team'
// OBJECTS
import seoImage from './objects/seoImage'
import contract from './objects/contract'
// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    // DOCUMENTS
    bep20,
    liveWallet,
    team,
    // OBJECTS
    seoImage,
    contract
  ]),
})
