from subprocess import check_output, Popen
import os
from pathlib import Path

absdir = Path(__file__).parent.absolute()
srcdir = absdir.parent
ccdir = srcdir / 'CodeCritic'
secret =  ccdir / 'appsettings.secret.json'
publish = srcdir.parent / 'publish'
tmp = publish / 'tmp'
tmpcc = tmp / 'cc.net-master'

github_zip = 'https://github.com/code-critic/cc.net/archive/refs/heads/master.zip'


def next_version(cwd: Path, prefix: str):
    i = 0
    while True:
        guess = cwd / f'{prefix}.{i}'
        if not guess.exists():
            return guess
        i += 1

def main():
    Popen(['rm', '-rf', str(tmp)]).wait()
    tmp.mkdir(exist_ok=True, parents=True)

    Popen(['wget', github_zip], cwd=str(tmp)).wait()
    Popen(['unzip', 'master.zip'], cwd=str(tmp)).wait()
    version = (tmpcc / 'version').read_text().strip()
    target_dir  = next_version(publish, version)
    cctarget = target_dir / 'CodeCritic'
    client = cctarget / '_client'

    Popen(['cp', '-r', str(tmpcc), str(target_dir)]).wait()
    Popen(['cp', str(secret), f'{cctarget}']).wait()
    Popen(['npm', 'install'], cwd=str(client)).wait()
    Popen(['npm', 'rebuild', 'node-sass'], cwd=str(client)).wait()
    Popen(['npm', 'run', 'build-css'], cwd=str(client)).wait()
    Popen(['dotnet', 'publish', '-c', 'Release'], cwd=str(cctarget)).wait()

    print("")
    print(f"new release {target_dir}")

if __name__ == '__main__':
    main()