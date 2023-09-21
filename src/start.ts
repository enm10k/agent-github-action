import {exec} from '@actions/exec'

export async function startAgent(
  imageName: string,
  containerName: string,
  apiKey: string,
  site: string,
  extra_env: string[]
): Promise<number> {
  const args = [
    'run',
    '-d',
    // https://docs.datadoghq.com/logs/guide/container-agent-to-tail-logs-from-host/?tab=docker
    '--cgroupns',
    'host',
    '--pid',
    'host',
    '--name',
    containerName,
    '-e',
    `DD_API_KEY=${apiKey}`,
    '-e',
    'DD_INSIDE_CI=true',
    '-e',
    'DD_HOSTNAME=none',
    '-e',
    `DD_SITE=${site}`,
    '-e',
    'DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true',
    '-p',
    '8125:8125/udp',
    '-p',
    '8126:8126/tcp',
    // '-v',
    // '/etc/datadog-agent/datadog.yaml:/etc/datadog-agent/datadog.yaml:ro',
    '-v',
    '/etc/datadog-agent/conf.d/logs.yaml:/etc/datadog-agent/conf.d/logs.yaml:ro',
    '-v',
    '/var/run/docker.sock:/var/run/docker.sock:ro',
    '-v',
    '/var/lib/docker/containers:/var/lib/docker/containers:ro',
    '-v',
    '/proc/:/host/proc/:ro',
    '-v',
    '/var/log/:/host/var/log/:ro',
    '-v',
    '/opt/datadog-agent/run:/opt/datadog-agent/run:rw',
    '-v',
    '/sys/fs/cgroup/:/host/sys/fs/cgroup:ro'
  ]

  for (const key_value of extra_env) {
    args.push('-e', key_value)
  }

  args.push(imageName)

  return exec('docker', args)
}

export async function getAgentHealth(containerName: string): Promise<number> {
  return exec('docker', ['exec', '-t', containerName, 'agent', 'health'], {ignoreReturnCode: true})
}
