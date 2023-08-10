const http2 = require('node:http2')
const fs = require('node:fs')

async function connect(authority, options) {
  return new Promise((resolve, reject) => {
    const session = http2.connect(authority, options)

    session.once('connect', (session) => {
      console.log('session connect')
      resolve(session)
    })

    session.once('close', () => {
      console.log('session close')
    })

    session.once('error', (err) => {
      console.error('session error')
      reject(err)
    })

  })
}

async function request(session) {
  return new Promise((resolve, reject) => {
    let stream

    const headers = {
      ":path": '/',
      ":method": 'POST'
    }

    try {
      stream = session.request(headers)
    } catch (err) {
      reject(err)
    }

    console.log(`request() session state: ${JSON.stringify(session.state)}`)

    stream.on('close', () => {
      console.info(`stream close with code ${stream.rstCode}`)
      if (stream.rstCode) {
        reject(`stream closed with code ${stream.rstCode}`)
      } else {
        resolve()
      }
    })

    stream.on('end', () => {
      console.info('stream end')
      resolve()
    })

    stream.on('error', (err) => {
      console.error(`stream error: ${err.message}`)
      reject(err)
    })

    stream.setTimeout(500, () => {
      console.log('stream timeout')
      reject(new Error('stream timeout'))
    })

    console.log('stream.write() with callback')
    stream.write(Buffer.from('writing some data', 'utf8'), (maybeErr) => {
      console.log(`stream write callback error: ${maybeErr}`)
      console.log('stream write callback: calling stream.end()')
      stream.end()
    })
  })
}

async function main() {
  // localhost:50051 is a http/2 server with a 1 millisecond timeout
  const authority = 'https://localhost:50051'

  const options = {
    ca: fs.readFileSync('./../cert/ca-cert.pem'),
    servername: 'example.cloudapis.test',
  }

  let session

  while (session === undefined) {
    try {
      session = await connect(authority, options)
    } catch (err) {
      console.error(`error creating session ${err.message}`)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  while (true) {
    try {
      await request(session)
    } catch (err) {
      console.error(`request() error ${err.message}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

function doOtherWork() {
  // To keep the node process alive
  setTimeout(doOtherWork, 1000)
}

main()
doOtherWork()
