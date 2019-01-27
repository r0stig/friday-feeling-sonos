const { DeviceDiscovery, Sonos, SpotifyRegion } = require('sonos')

const DEVICE_NAME = 'Kök'
const SONGS = [
    'spotify:track:6kKJbnWfmVUKnhqa8n17xT',
    'spotify:track:0fffmMPRtCUDxlGBLfa2kt',
    'spotify:track:1jr1y7XQdiwu2s9zEyYcBN',
    'spotify:track:40SKRZTwVekoCmrt3yuuQS',
    'spotify:track:1L6S78cdI7Md1GHgxRd4Wr',
    'spotify:track:2y0bJWqWemoabqc7H4ye5O'
]
const devices = []
DeviceDiscovery((device) => {
    devices.push(device)
})

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    })
 }

async function waitUntilDiscovered (name) {
    const device = await findSonosByName(name)
    if (!device) {
        return delay(200).then(() => waitUntilDiscovered(name))
    } else {
        return device
    }
}

async function findSonosByName (name) {
    for (let i = 0; i < devices.length; i++) {
        const desc = await devices[i].deviceDescription()
        if (desc.roomName === name) {
            return devices[i]
        }
    }
    return undefined
}


async function queueRolandz (sonos, position) {
    sonos.setSpotifyRegion(SpotifyRegion.EU)
    const songs = [ ...SONGS ]
    songs.reverse()
    return Promise.all(songs.map(async (song) => await sonos.queue(song, position)))
}


waitUntilDiscovered(DEVICE_NAME).then(async (device) => {
    console.log('Found device', DEVICE_NAME)
    const sonos = new Sonos(device.host)
    const state = await sonos.getCurrentState()

    if (state === 'playing' || state === 'paused') {
        const curTrack = await sonos.currentTrack()
        const curTrackQueuePosition = curTrack.queuePosition
        await queueRolandz(sonos, curTrackQueuePosition + 1)
    } else if (state === 'stopped') {
        await queueRolandz(sonos, 0)
        await sonos.selectQueue()
    }

    if (state === 'paused') {
        await sonos.next()
    }
    await sonos.play()
    console.log('Successfully executed friday feeling')
    process.exit(0)
})
