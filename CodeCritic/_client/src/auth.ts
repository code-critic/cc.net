import { IAppUser } from './cc-api';

const defaultAuthUrl = `https://flowdb.nti.tul.cz/auth/index.php`;
const defaultLoginUrl = `${defaultAuthUrl}?returnurl=${window.location.origin}/home/login`;

export const auth = () => {
    return new Promise((resolve, reject) => {
        if ((window as any).currentUser) {
            resolve((window as any).currentUser);
        }

        fetch("home/whoami")
            .then(response => {
                if (response.status === 200) {
                    response
                        .json()
                        .then((data: IAppUser) => {
                            (window as any).currentUser = data;
                            resolve((window as any).currentUser);
                        })
                } else {
                    if (response.status === 203) {
                        response
                        .json()
                        .then((data: any) => {
                            const { error, message, redirect } = data;
                            (window as any).location.href = defaultLoginUrl;
                        })
                    } else {
                        console.log('auth error', (window as any).currentUser);
                        (window as any).location.href = defaultLoginUrl;
                        reject();
                    }
                }
            })
            .catch(response => {
                debugger;
                console.log('auth error', (window as any).currentUser);
                (window as any).location.href = defaultLoginUrl;
                reject();
            })
    });
}
