import { createServer } from 'http'
import { parse } from 'url'

const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url!, true)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (pathname === '/photos' && req.method === 'GET') {
    try {
      const filters = {
        title: query.title || null,
        albumTitle: query['album.title'] || null,
        userEmail: query['album.user.email'] || null,
        limit: parseInt(<string>query.limit || '25'),
        offset: parseInt(<string>query.offset || '0')
      }

      const photoQuery = await buildPhotoQuery(filters)
      const photosResponse = await fetch(`https://jsonplaceholder.typicode.com/photos?${photoQuery}`)
      const photos = await photosResponse.json()
      const enrichedPhotos = await enrichPhotos(photos)

      res.statusCode = 200
      res.end(JSON.stringify(enrichedPhotos))
    } catch (error) {
      res.statusCode = 500
      res.end(JSON.stringify({error: 'Failed to fetch photo data'}))
    }
  } else if (pathname?.startsWith('/photos/') && req.method === 'GET') {
    try {
      const photoId = pathname.split('/')[2]

      const photoResponse = await fetch(`https://jsonplaceholder.typicode.com/photos/${photoId}`)
      const photo = await photoResponse.json()

      const enrichedPhotos = await enrichPhotos([photo])

      res.statusCode = 200
      res.end(JSON.stringify(enrichedPhotos[0]))
    } catch (error) {
      res.statusCode = 500
      res.end(JSON.stringify({error: 'Failed to fetch photo data'}))
    }
  } else {
    res.statusCode = 404
    res.end(JSON.stringify({error: 'Not found'}))
  }
})

server.listen(3001)

async function fetchAlbumsByIds(albumIds: number[]): Promise<any[]> {
  if (albumIds.length === 0) return []

  const query = albumIds.map(id => `id=${id}`).join('&')
  const response = await fetch(`https://jsonplaceholder.typicode.com/albums?${query}`)
  return response.json()
}

async function fetchUsersByIds(userIds: number[]): Promise<any[]> {
  if (userIds.length === 0) return []

  const query = userIds.map(id => `id=${id}`).join('&')
  const response = await fetch(`https://jsonplaceholder.typicode.com/users?${query}`)
  return response.json()
}

async function buildPhotoQuery(filters: any) {
  const queryParams: string[] = []
  let albumIds: number[] = []

  if (filters.title) {
    queryParams.push(`title_like=${encodeURIComponent(filters.title)}`)
  }
  queryParams.push(`_limit=${filters.limit}`)
  queryParams.push(`_start=${filters.offset}`)

  if (filters.albumTitle) {
    const albumResponse = await fetch(`https://jsonplaceholder.typicode.com/albums?title_like=${encodeURIComponent(filters.albumTitle)}`)
    const matchingAlbums = await albumResponse.json()
    albumIds = matchingAlbums.map((album: any) => album.id)
  }

  if (filters.userEmail) {
    const userResponse = await fetch(`https://jsonplaceholder.typicode.com/users?email=${encodeURIComponent(filters.userEmail)}`)
    const matchingUser = await userResponse.json()

    if (matchingUser.length === 0) {
      albumIds = []
    }
    else {
      const userId = matchingUser[0].id
      const albumResponse = await fetch(`https://jsonplaceholder.typicode.com/albums?userId=${userId}`)
      const userAlbums = await albumResponse.json()
      const userAlbumIds = userAlbums.map((album: any) => album.id)

      albumIds = albumIds.length > 0
        ? albumIds.filter(id => userAlbumIds.includes(id))
        : userAlbumIds
    }
  }

  albumIds.forEach(id => queryParams.push(`albumId=${id}`))

  return queryParams.join('&')
}

async function enrichPhotos(photos: any[]): Promise<any[]> {
  if (photos.length === 0) return []

  const uniqueAlbumIds = [...new Set(photos.map((photo: any) => photo.albumId))]
  const albums = await fetchAlbumsByIds(uniqueAlbumIds)

  const uniqueUserIds = [...new Set(albums.map((album: any) => album.userId))]
  const users = await fetchUsersByIds(uniqueUserIds)

  const albumMap = new Map(albums.map(album => [album.id, album]))
  const userMap = new Map(users.map(user => [user.id, user]))

  return photos.map((photo: any) => {
    const album = albumMap.get(photo.albumId)
    const user = userMap.get(album?.userId)

    return {
      id: photo.id,
      title: photo.title,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      album: {
        id: album.id,
        title: album.title,
        user: user
      }
    }
  })
}