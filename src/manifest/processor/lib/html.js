import path from 'path'
import fs from 'fs-extra'

import * as log from '../../../utils/log'
import * as Remove from '../../../utils/remove';
import script from './script'

const makeLayout = function({script, body}) {
  return (
`<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
  </head>
  <body>
    ${body}
    ${script}
  </body>
</html>`
  )
}

export default function(htmlFilepath, src, build) {
  log.pending(`Making html '${htmlFilepath}'`)

  // Read body content
  const htmlContent = fs.readFileSync(path.resolve(src, htmlFilepath), {encoding: "utf8"})

  // Get just path and name ie: 'popup/index'
  const bareFilepath = Remove.extension(htmlFilepath)

  const scriptFilepath = `${bareFilepath}.js`

  const webpackScriptUrl = process.env.NODE_ENV == "development" ? path.join("https://localhost:3001", scriptFilepath) : `/${scriptFilepath}`
  const webpackScript = `<script src="${webpackScriptUrl}" async defer></script>`;

  script(scriptFilepath, build)

  const html = makeLayout({
    body:   htmlContent,
    script: webpackScript
  })

  const fullHtmlPath = path.join(build, htmlFilepath)

  fs.mkdirsSync(Remove.file(fullHtmlPath))

  fs.writeFileSync(fullHtmlPath, html)

  log.done()

  return scriptFilepath
}
