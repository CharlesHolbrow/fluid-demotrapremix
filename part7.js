const fluid = require('fluid-music')
const { converters, random } = fluid
const { range } = converters
const dLibrary = require('./d-library').dLibrary
const kit = require('@fluid-music/kit')
const rides = require('@fluid-music/rides')
const tr808 = require('@fluid-music/tr-808')
const { dragonflyHall, tStereoDelay } = require('./presets')
const { copyTrackMidiClips, makeArp6Tracks, makeArp6TLibraryFromMidiChords, makeArp6SModulationTLibrary } = require('./components')
const chordLibraries = [
  require('./chords/seven-notes'),
  require('./chords/midi-chords'),
]

const tLibraryBass = {
  g: fluid.techniques.AudioFile.copy(tr808.bass.g, { startInSourceSeconds: 0.275, fadeInSeconds: 0.035, fadeOutSeconds: 0.1 }),
  d: fluid.techniques.AudioFile.copy(tr808.bass.g, { startInSourceSeconds: 0.275, fadeInSeconds: 0.035, fadeOutSeconds: 0.1, pitchSemitones: -5, gainDb: 3, }),
  1: fluid.techniques.AudioFile.copy(tr808.bass.g),
  5: fluid.techniques.AudioFile.copy(tr808.bass.g, { pitchSemitones: -5 })
}

const bpm = 70
const quarterNote = 1 / bpm * 60
const delay32 = quarterNote / 8
const delay8 = quarterNote / 2
const delay7 = quarterNote / 7
const delays4times7over32 = [delay32 * 7, delay32 * 14, delay32 * 21, delay32 * 28]

const session = new fluid.FluidSession({ bpm, dLibrary }, [
  makeArp6Tracks(bpm),
  { name: 'bass', gainDb: -8, tLibrary: tr808.bass },
  { name: 'drums', gainDb: -5.2, tLibrary: kit.tLibrary, children: [
    { name: 'kick' },
    { name: 'snare', gainDb: -8.5 },
    { name: 'hat', gainDb: -16 },
    { name: 'ride', gainDb: -10 },
    { name: 'rideSoft', gainDb: -22 },
  ]},
  { name: 'delay16th', gainDb: -13, plugins: [ tStereoDelay.sixteenth(bpm) ] },
  { name: 'verbLong', plugins: [dragonflyHall.long()] },
  { name: 'verbShort', gainDb: -25, plugins: [dragonflyHall.short()] },
])
session.getTrackByName('verbShort').addReceiveFrom(session.getTrackByName('arp6'))
session.getTrackByName('verbLong').addReceiveFrom(session.getTrackByName('arp64'), -17)
const delay16Track = session.getTrackByName('delay16th')
// arp6 delays
delay16Track.addReceiveFrom(session.getTrackByName('arp6'))
delay16Track.addReceiveFrom(session.getTrackByName('arp62'), -4.5)
delay16Track.addReceiveFrom(session.getTrackByName('arp64'), -7)
// sync delays
delay16Track.addReceiveFrom(session.getTrackByName('arp6S1'))
delay16Track.addReceiveFrom(session.getTrackByName('arp6S3'))

const scoreADefaultTLibrary = makeArp6TLibraryFromMidiChords([delay32 * 7, delay32 * 14, delay32 * 21, delay32 * 28], [7, -7, 2, 3], null, chordLibraries[0])
const scoreA = {
  tLibrary: scoreADefaultTLibrary,
  d:    '7',
  r:    '1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...+...',
  arp6: 'a------                            b------                            c------                            d------                            ',
}
const scoreADrums = {
  drums: {
  kick: 'D------              d------       D             d------              D------              d------       D             d------              ',
  snare:'       s            s       s           sss                    s             s            s       s            ss             s           ss',
  hat: {
  hat:  ' tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt tttttt',
  d:    ' 494847 494745 494745 494745 494745 494745 494847 494745 494745 494745 494745 349474 494847 494745 494745 494745 494745 494745 494847 494745',
  },
  ride: {
  ride: 'd------b------c------d------a------d------b------c------d------c------d------b------c------d------b------d------b------c------d------c------',
  tLibrary: rides.rides
  },
  tLibrary: kit.tLibrary,
  }
}

const scoreB = {
  tLibrary: scoreADefaultTLibrary,
  d:        '7',
  r:        '1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...tttt',
  arp6:     'a------                            b------                            c------                               ',
  bass: {
  r:        '1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...tttt',
  bass:     'g-------------g-------------g------g-------------                     d---------------------------',
  d:        '6             4             2      7                                  8                           ',
  tLibrary: tLibraryBass,
  },
  rideSoft: {
  d:        '1',
  rideSoft: 'd------b------c------d------d------a------b------c------d------c------d------b------c------d------b---------',
  tLibrary: rides.rides
  }
}

const tFadeOut = new fluid.techniques.TrackGainAutomationRamp({ gainDb: -Infinity })
const tFadeToUnity = new fluid.techniques.TrackGainAutomationRamp({ gainDb: 0 })
const tFadeToMinus12Db = new fluid.techniques.TrackGainAutomationRamp({ gainDb: -12 })
const tFadeTo3Db = new fluid.techniques.TrackGainAutomationRamp({ gainDb: 3 })
const tFadeTo6Db = new fluid.techniques.TrackGainAutomationRamp({ gainDb: 6 })
const tFadeToUnityCurve = new fluid.techniques.TrackGainAutomationRamp({ gainDb: 0, curve: 0.8 })


scoreB.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -7, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 8, 10])
session.insertScore({ ...scoreB, bass: undefined, arp6S: '0', arp6S1: '0', arp6S2: '0', arp6S3: '0', arp6S4: '0' })

// Mute the delay16th track and insert the "bridge"
session.useTechnique(tFadeOut,  { track: delay16Track, durationSeconds: 0.01 })
session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay7 * 4, delay7 * 7, delay7 * 11, delay7 * 14], [7, -7, 2, 3], null, chordLibraries[0]),
  d:     '7',
  r:     '1 2 3 4 1 2 3 4 1 2 3 4 1 2 3 4 1++',//1 2 3 4 1 2 3 4 1 2 3 4 1 2 3 4 1++
  arp6: ['a-              b-    c-    d-     ', '        e             d-'],
  ride: {
  ride:  'c-b-c-a-b-a-b-a-c-b-c-d-b-a-b-a-a--',
  d:     '3   2 3 0 2         2 1 3       8',
  tLibrary: rides.rides
  }
})

// Fade the delay back in over 20s
session.useTechnique(tFadeToUnity, { track: delay16Track, durationSeconds: 20 })
scoreB.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -7, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 8, 3])
session.insertScore({ scoreB,  r:'1' , arp6S: '7'})
scoreB.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -7, 2, 3], null, chordLibraries[0],  [0, 2, 5, 7, 2, 3, 8])
session.insertScore({scoreB, r:'1' , arp6S1: '8'})
scoreB.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -7, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 8, 10])
session.insertScore({ scoreB, r: '1', arp6S2: '8', arp6S3: '6', arp6S4: '6' })

session.useTechnique(tFadeToMinus12Db, { track: 'arp', duration: 0.01, startTime: session.editCursorTime -0.01 })
session.useTechnique(tFadeToUnityCurve, { track: 'arp', startTime: session.editCursorTime + 0.01, duration: 4 })
session.useTechnique(tFadeTo6Db, { track: delay16Track, duration: 4.2 })

scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, 0, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 8, 3])
session.insertScore(scoreA)



scoreA.drums = scoreADrums
scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, 0, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 3])
session.insertScore(scoreA)

scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [1, -1, 2, 3], null, chordLibraries[0],  [0, 3, 5, 10])
session.insertScore(scoreA)

scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -7, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7, 3])
session.insertScore(scoreA)

scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [7, -2, 2, 3], null, chordLibraries[0],  [0, 2, 3, 5, 7])
session.insertScore(scoreA)

scoreA.tLibrary = makeArp6TLibraryFromMidiChords(delays4times7over32, [1, -2, 2, -1], null, chordLibraries[0],  [0, -2, 2, 3, 7, 5, 8])
session.insertScore(scoreA)

session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay8, delay8 * 2, delay8 * 3, delay8 * 4], [7, -7, 2, 3], null, chordLibraries[0]),
  d:    '7',
  r:    '1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...',
  arp6: 'a------             b------             c------             d------   ',
  drums: {
  kick: 'D------              D------    d---    D------              D------    d---    ',
  snare:'       s------      s       s         ss       s------      s       s         ss',
  hat: {
  hat:  ' tttttt tttttt tttttt tttttt tttttt tttt tttttt tttttt tttttt tttttt ttttttttttt',
  d:    ' 494847 494745 494745 494745 494745 4947 494847 494745 494745 494745 49474534947',
  },
  tLibrary: kit.tLibrary,
  }
})

session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay8, delay8 * 2, delay8 * 3, delay8 * 4], [7, -7, 2, 3], null, chordLibraries[0]),
  d:    '7',
  r:    '1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...1...+...2...+...3...+...4...+...',
  arp6: 'e------             f------             g------             a------              ',
  drums: {
  kick: 'D------                 d------         D------                 d------          ',
  snare:'        s              s              ss        s              s              ss ',
  hat: {
  hat:  ' ttttttt ttttttt ttttttt ttttttttttttttt ttttttt ttttttt ttttttt ttttttttttttttt',
  d:    ' 4948474 4947454 4947454 494745424947454 4948474 4947454 4947454 494745424947454',
  },
  tLibrary: kit.tLibrary,
  }
})


// Random experiments after this point!

session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay8, delay8 * 2, delay8 * 3, delay8 * 4], [2, 0, -2, 0], null, chordLibraries[1]),
  d:    '7',
  r:    '1...+...2...+...3...+...4...+...1...+...2...+...3...+...1...+...2...+...3...+...',
  arp6: 'a------             b------             c------             d------   ',
  drums: {
  kick: 'D------                 d------         D------                 d------         ',
  snare:'        s              s              ss        s              s              ss',
  hat: {
  hat:  ' ttttttt ttttttt ttttttt ttttttttttttttt ttttttt ttttttt ttttttt ttttttttttttttt',
  d:    ' 4948474 4947454 4947454 494745424947454 4948474 4947454 4947454 494745424947454',
  },
  tLibrary: kit.tLibrary,
  }
})

session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay8, delay8 * 2, delay8 * 3, delay8 * 4], [-1,-2,-3,-4], null, chordLibraries[0]),
  d:    '7',
  r:    '1...+...2...+...3...+...4...+...1...+...2...+...3...+...1...+...2...+...3...+...',
  arp6: 'a------             b------             c------             d------   ',
  drums: {
  kick: 'D------                 d------         D------                 d------         ',
  snare:'        s              s              ss        s              s              ss',
  hat: {
  hat:  ' ttttttt ttttttt ttttttt ttttttttttttttt ttttttt ttttttt ttttttt ttttttttttttttt',
  d:    ' 4948474 4947454 4947454 494745424947454 4948474 4947454 4947454 494745424947454',
  },
  tLibrary: kit.tLibrary,
  }
})

session.insertScore({
  tLibrary: makeArp6TLibraryFromMidiChords([delay7 * 2, delay7 * 4, delay7 * 6, delay7 * 8 ], [7, -7, 2, 3], null, chordLibraries[0]),
  d:    '7',
  r:    '1 2 3 4 1 2 3 4 ',
  arp6: 'a   b   c   d   ',
})

for (const suffix of ['', '1', '2', '3', '4']) copyTrackMidiClips(session, 'arp6'+suffix, 'arp6S'+suffix)

session.finalize()
session.saveAsReaperFile('part7')
  .then(() => console.log('done'))
  .catch((e) => { throw e })
