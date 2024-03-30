from subprocess import PIPE, check_output, Popen
from optparse import OptionParser
import os, sys
from pathlib import Path
import subprocess


parser = OptionParser()
parser.add_option("-p", "--port", type=str, default="80")
parser.add_option("-k", "--kill", dest="kill", action="store_true", default=False)
parser.add_option("-b", "--background", action="store_false", default=False)
parser.add_option("-e", "--execute", action="store_true", default=False)
parser.add_option("--dbg", type=str, default=None)
parser.add_option("-u", "--url", type=str, default='https://github.com/code-critic/cc.net/archive/refs/heads/master.zip')
options, args = parser.parse_args()


absdir = Path(__file__).parent.absolute()
srcdir = absdir.parent
ccdir = srcdir / 'CodeCritic'
secret =  ccdir / 'appsettings.secret.json'
secret2 =  ccdir / 'appsettings.json'
publish = srcdir.parent / 'publish'
tmp = publish / 'tmp'
tmpcc = tmp / 'cc.net-master'

kill_previous = options.kill is True
port = options.port
github_zip = options.url
background = options.background
dbg = options.dbg


def create_symlink(ccpublish: Path):
    cc_net = ccpublish / 'cc.net'
    local_bin = Path(os.environ.get("HOME")) / '.local' / 'bin' / 'cc.latest'
    local_bin.unlink(missing_ok=True)
    
    os.symlink(cc_net, local_bin)
    print(local_bin, "->", cc_net)

if dbg:
    ccpublish = publish / "1.1.0" / "www"
    create_symlink(ccpublish)
    exit(0)


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
    Popen(['cp', str(secret2), f'{cctarget}']).wait()
    Popen(['npm', 'install'], cwd=str(client)).wait()
    Popen(['npm', 'rebuild', 'node-sass'], cwd=str(client)).wait()
    Popen(['npm', 'run', 'build-css'], cwd=str(client)).wait()
    Popen(['dotnet', 'publish', '-c', 'Release', '-o', str(ccpublish)], cwd=str(cctarget)).wait()

    print("")
    print(f"new release {ccpublish}")
    create_symlink(ccpublish)

    if kill_previous:
        Popen(['killall', 'cc.net']).wait(1.0)
        Popen(['killall', '-9', 'cc.net']).wait(1.0)

    if options.execute:
        if background:
            Popen(['./cc.net', '--urls', f'http://0.0.0.0:{port}'], cwd=str(ccpublish),
                stdout=PIPE, stderr=subprocess.STDOUT, preexec_fn=os.setsid)
            exit(0)
        else:
            Popen(['./cc.net', '--urls', f'http://0.0.0.0:{port}'], cwd=str(ccpublish)).wait()
    else:
        print('restart cc by running\nkillall cc.latest')

if __name__ == '__main__':
    main()
