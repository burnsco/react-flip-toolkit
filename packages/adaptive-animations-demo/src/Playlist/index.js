import React, { useState, useEffect } from 'react'
import { Flipper, Flipped, Swipe } from 'react-flip-toolkit'
import playlists from '../playlists'
import * as Styled from './styled-elements'
import PlaylistHeader from './Header'
import trashIcon from '../assets/trashIcon.svg'
import playIcon from '../assets/playIcon.svg'
import pauseIcon from '../assets/pauseIcon.svg'
import { usePrevious } from '../utilities'
import { spring } from '../App'
const ListItem = ({
  setIsPlaying,
  isPlaying,
  track,
  currentlyViewed,
  deleteTrack
}) => {
  const [isGettingDeleted, setIsGettingDeleted] = useState(false)

  const callOnce = (func, threshold) => {
    let isCalled = false
    return springVal => {
      if (springVal >= threshold && !isCalled) {
        isCalled = true
        func()
      }
    }
  }
  return (
    <Styled.CollapsedTrackContainer flipKey={isGettingDeleted} spring={spring}>
      <Flipped flipId={`${track.id}-trash`} >
        <Styled.TrashIconContainer isGettingDeleted={isGettingDeleted}>
          <img src={trashIcon} alt="remove song" />
        </Styled.TrashIconContainer>
      </Flipped>

      <Swipe
        right={{
          initFlip: () => setIsGettingDeleted(true),
          cancelFlip: () => setIsGettingDeleted(false)
        }}
        threshold={0.4}
      >
        <Flipped
          stagger
          flipId={`track-${track.id}`}
          onSpringUpdate={callOnce(() => {
            if (isGettingDeleted) {
              deleteTrack(track.id)
            }
          }, 0.85)}
        >
          <Styled.CollapsedTrack
            currentlyViewed={currentlyViewed}
            isGettingDeleted={isGettingDeleted}
            href="#"
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(null)
              } else {
                setIsPlaying(track.id)
              }
            }}
          >
            <Styled.PlayButton isPlaying={isPlaying}>
              <img src={isPlaying ? pauseIcon : playIcon} />{' '}
            </Styled.PlayButton>
            <div>
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
          </Styled.CollapsedTrack>
        </Flipped>
      </Swipe>
    </Styled.CollapsedTrackContainer>
  )
}

export const updateLocationWithSearchParams = (location, search) => {
  const searchParams = new URLSearchParams(location.search)
  Object.keys(search).forEach(key => searchParams.set(key, search[key]))
  const newLocation = Object.assign({}, location, {
    search: searchParams.toString()
  })
  return newLocation
}

const Playlist = props => {
  const playlist = playlists.find(
    playlist => playlist.id === parseInt(props.match.params.id, 10)
  )
  const [visibleTracks, setVisibleTracks] = useState(playlist.tracks)
  const [isPlaying, setIsPlaying] = useState(null)

  const headerCollapsed =
    new URLSearchParams(props.location.search).get('headerCollapsed') === 'true'

  const toggleCollapsed = () => {
    props.history.push(
      updateLocationWithSearchParams(props.location, {
        headerCollapsed: !headerCollapsed
      })
    )
  }

  const deleteTrack = id => {
    setVisibleTracks(prevState => {
      return prevState.filter(({ id: trackId }) => id !== trackId)
    })
  }

  return (
    <Flipper flipKey={`${JSON.stringify(visibleTracks)}`} spring={spring}>
      <PlaylistHeader
        playlist={playlist}
        collapsed={headerCollapsed}
        toggleCollapsed={toggleCollapsed}
      />
      <Styled.List collapsed={headerCollapsed}>
        {visibleTracks.map(track => (
          <Styled.Li key={track.id}>
            <ListItem
              track={track}
              deleteTrack={deleteTrack}
              setIsPlaying={setIsPlaying}
              isPlaying={isPlaying === track.id}
            />
          </Styled.Li>
        ))}
      </Styled.List>
    </Flipper>
  )
}

export default React.memo(Playlist)
