import { XMLParser } from 'fast-xml-parser'
import fs from 'node:fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

function getMavenMetadataFiles(dirpath: string) {
  const files: string[] = []

  for (const file of fs.readdirSync(dirpath)) {
    const filepath = `${dirpath}/${file}`
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      files.push(...getMavenMetadataFiles(filepath))
    } else {
      if (!file.endsWith('maven-metadata.xml')) {
        continue
      }
      files.push(filepath)
    }
  }

  return files
}

class MavenMetadata {
  constructor(
    public groupId: string,
    public artifactId: string,
    public latestVersion: string,
    public versions: string[]
  ) {
    this.groupId = groupId
    this.artifactId = artifactId
    this.latestVersion = latestVersion
    this.versions = versions
  }
}

function parseMavenMetadata(path: string): MavenMetadata | null {
  const content = fs.readFileSync(path, 'utf8')
  const parser = new XMLParser()
  const metadata: {
    metadata: {
      groupId: string
      artifactId: string
      version?: string
      versioning?: {
        latest?: string
        release?: string
        versions?: {
          version: string | string[]
        }
      }
    }
  } = parser.parse(content)
  console.log(metadata)
  const latestVersion =
    metadata.metadata.versioning?.latest ??
    metadata.metadata.versioning?.release ??
    metadata.metadata.version ??
    null
  if (latestVersion === null) {
    console.warn(`latest version not found: ${path} (skipping)`)
    return null
  }
  const rawVersions = metadata.metadata.versioning?.versions?.version ?? []
  const versions = Array.isArray(rawVersions) ? rawVersions : [rawVersions]
  return new MavenMetadata(
    metadata.metadata.groupId,
    metadata.metadata.artifactId,
    latestVersion,
    versions
  )
}

function getDependencyXml(metadata: MavenMetadata) {
  return `
<dependency>
    <groupId>${metadata.groupId}</groupId>
    <artifactId>${metadata.artifactId}</artifactId>
    <version>${metadata.latestVersion}</version>
</dependency>
  `.trim()
}

function generateREADME(repositories: MavenMetadata[]) {
  const contents = []
  for (const repository of repositories) {
    const dependencyXml = getDependencyXml(repository)
    const versions = repository.versions
      .map((version) => `- \`${version}\``)
      .join('\n')

    contents.push(
      `
### ${repository.groupId}/${repository.artifactId}

\`\`\`xml
${dependencyXml}
\`\`\`

#### Versions

${versions}
      `.trim()
    )
  }
  return contents.join('\n\n')
}

function main() {
  const argv = yargs(hideBin(process.argv))
    .option('target', {
      description: 'Target path',
      type: 'string',
      demandOption: true,
    })
    .option('output', {
      description: 'Output path',
      type: 'string',
      demandOption: true,
    })
    .help()
    .parseSync()
  const mavenMetadataFiles = getMavenMetadataFiles(argv.target)
  const metadatas: MavenMetadata[] = []
  for (const mavenMetadataFile of mavenMetadataFiles) {
    const metadata = parseMavenMetadata(mavenMetadataFile)
    if (metadata !== null) {
      metadatas.push(metadata)
    }
  }

  const readme = generateREADME(metadatas)
  const template = fs.readFileSync('template.md').toString()
  fs.writeFileSync(argv.output, template.replace('{{REPOSITORYS}}', readme))
}

main()
