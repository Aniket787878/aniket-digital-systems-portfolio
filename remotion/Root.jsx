import { Composition } from 'remotion'
import { projects } from '../src/data.js'
import { VIDEO } from './config.js'
import { ProjectVideo } from './ProjectVideo.jsx'

/* One composition, parameterised by project slug. Rendered once per project
   with --props='{"slug":"..."}'. */
export const RemotionRoot = () => {
  return (
    <Composition
      id="ProjectVideo"
      component={ProjectVideo}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{ slug: projects[0].slug }}
    />
  )
}
