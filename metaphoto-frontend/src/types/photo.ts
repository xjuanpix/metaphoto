export interface PhotoModel {
  id: number
  title: string
  url: string
  thumbnailUrl: string
  album: {
    id: number
    title: string
    user: {
      id: number
      name: string
      username: string
      email: string
      address: {
        street: string
        suite: string
        city: string
        zipcode: string
        geo: {
          lat: string
          lng: string
        }
      }
      phone: string
      website: string
      company: {
        name: string
        catchPhrase: string
        bs: string
      }
    }
  }
}