export type TransactionHash = {
  [hash: string] : {
    status: 'pending' | 'success' | 'error',
    description: string,
    more?: any,
  }
}