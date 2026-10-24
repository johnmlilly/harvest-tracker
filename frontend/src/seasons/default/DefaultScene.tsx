import { SceneFrame } from '../../scenes/SceneFrame'
import { Cloud, FarmLights, Farmstead, Field, Hills, Moon, Stars, Sun, Tree } from '../../scenes/parts'
import type { SceneProps } from '../types'

/** Generic farm under the sky. Land colors follow the season; light follows the time of day. */
export function DefaultScene({ season, time }: SceneProps) {
  const sky =
    time === 'night' ? (
      <>
        <Stars />
        <Moon x={1265} y={160} />
      </>
    ) : (
      <>
        <Sun time={time} />
        <g className="scene-clouds">
          <g className="scene-glide">
            <Cloud x={620} y={130} />
            <Cloud x={1040} y={230} scale={0.7} />
            <Cloud x={180} y={300} scale={0.55} />
          </g>
        </g>
      </>
    )

  return (
    <SceneFrame season={season} time={time} sky={sky} lights={<FarmLights x={1250} y={600} scale={0.8} />}>
      <Hills />
      <Tree x={60} y={545} scale={0.6} leaf="a" />
      <Tree x={150} y={536} scale={0.75} leaf="b" />
      <Tree x={250} y={542} scale={0.62} leaf="c" />
      <Tree x={480} y={530} scale={0.7} leaf="a" />
      <Tree x={720} y={526} scale={0.75} leaf="b" />
      <Tree x={820} y={532} scale={0.6} leaf="c" />
      <Tree x={1060} y={524} scale={0.72} leaf="a" />
      <Tree x={1530} y={522} scale={0.75} leaf="b" />
      <Farmstead x={1250} y={600} scale={0.8} />
      <Field />
    </SceneFrame>
  )
}
