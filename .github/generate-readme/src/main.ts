import { XMLParser } from 'fast-xml-parser'
import fs from 'node:fs'
import * as yargs from 'yargs'

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

function parseMavenMetadata(path: string): MavenMetadata {
  const content = fs.readFileSync(path, 'utf8')
  const parser = new XMLParser()
  const metadata = parser.parse(content)
  console.log(metadata)
  return new MavenMetadata(
    metadata.metadata.groupId,
    metadata.metadata.artifactId,
    metadata.metadata.versioning.latest === undefined
      ? metadata.metadata.versioning.release === undefined
        ? null
        : metadata.metadata.versioning.release
      : metadata.metadata.versioning.latest,
    metadata.metadata.versioning.versions.version
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
    const versions = (
      Array.isArray(repository.versions)
        ? repository.versions
        : [repository.versions]
    )
      .map((version) => {
        console.log(version)
        return `- \`${version}\``
      })
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

function main(argv: any) {
  const mavenMetadataFiles = getMavenMetadataFiles(argv.target)
  const metadatas = []
  for (const mavenMetadataFile of mavenMetadataFiles) {
    metadatas.push(parseMavenMetadata(mavenMetadataFile))
  }

  const readme = generateREADME(metadatas)
  const template = fs.readFileSync('template.md').toString()
  fs.writeFileSync(argv.output, template.replace('{{REPOSITORYS}}', readme))
}

main(
  yargs
    .option('target', {
      description: 'Target path',
      demandOption: true,
    })
    .option('output', {
      description: 'Output path',
      demandOption: true,
    })
    .help().argv
)
