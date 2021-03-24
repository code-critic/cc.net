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
    # target_dir  = Path('/home/jan-hybs/projects/cc/publish/1.0.9')
    Popen(['rm', '-rf', str(tmp)]).wait()
    tmp.mkdir(exist_ok=True, parents=True)

    Popen(['wget', github_zip], cwd=str(tmp)).wait()
    Popen(['unzip', '-q', 'master.zip'], cwd=str(tmp)).wait()

    version = (tmpcc / 'version').read_text().strip()
    target_dir  = next_version(publish, version)
    cctarget = target_dir / 'cc.net-master' / 'CodeCritic'
    ccpublish = target_dir / 'www'
    client = cctarget / '_client'

    target_dir.mkdir(exist_ok=True, parents=True)
    Popen(['cp', '-r', str(tmpcc), str(target_dir)]).wait()
    Popen(['cp', str(secret), f'{cctarget}']).wait()
    Popen(['npm', 'install'], cwd=str(client)).wait()
    Popen(['npm', 'rebuild', 'node-sass'], cwd=str(client)).wait()
    Popen(['npm', 'run', 'build-css'], cwd=str(client)).wait()
    Popen(['dotnet', 'publish', '-c', 'Release', '-o', str(ccpublish)], cwd=str(cctarget)).wait()

    print("")
    print(f"new release {ccpublish}")

    Popen(['killall', 'cc.net']).wait(1.0)
    Popen(['killall', '-9', 'cc.net']).wait(1.0)
    Popen(['./cc.net', '--urls', 'http://0.0.0.0:5000'], cwd=str(ccpublish)).wait()

if __name__ == '__main__':
    main()