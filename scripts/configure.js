// Usage: node scripts/configure.js <channel>
// Sets config.json and package.json build settings for a given customer channel.
// Run before electron-builder in CI.

const fs = require('fs')
const path = require('path')

const channel = process.argv[2]
if (!channel) {
  console.error('Usage: node scripts/configure.js <channel>')
  process.exit(1)
}

const root = path.join(__dirname, '..')
const sourceConfig = path.join(root, `config-${channel}.json`)

if (!fs.existsSync(sourceConfig)) {
  console.error(`No config file found for channel: ${channel} (expected config-${channel}.json)`)
  process.exit(1)
}

// Copy the customer config to the active config.json
fs.copyFileSync(sourceConfig, path.join(root, 'config.json'))

// Populate manuals/ from the channel-specific manuals folder
const manualsDir = path.join(root, 'manuals')
const channelManualsDir = path.join(root, `manuals-${channel}`)

// Clear any existing manuals
if (fs.existsSync(manualsDir)) {
  fs.readdirSync(manualsDir)
    .filter(f => f !== '.gitkeep')
    .forEach(f => fs.unlinkSync(path.join(manualsDir, f)))
}

// Copy channel-specific manuals in
if (fs.existsSync(channelManualsDir)) {
  fs.readdirSync(channelManualsDir)
    .filter(f => f !== '.gitkeep')
    .forEach(f => {
      fs.copyFileSync(path.join(channelManualsDir, f), path.join(manualsDir, f))
    })
}

// Update package.json with the channel and a unique artifact name
const pkgPath = path.join(root, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

pkg.build.publish.channel = channel
pkg.build.win.artifactName = `\${productName}-${channel}-Setup-\${version}.\${ext}`

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

console.log(`Configured for channel: ${channel}`)
